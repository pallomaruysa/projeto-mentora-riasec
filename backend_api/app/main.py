import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware # <-- Importação do CORS


# Compatibilidade para desserialização do preprocessor salvo
# O objeto serializado espera encontrar a classe `FeatureExpander`
# definida no módulo `app.main`. Recriamos aqui uma implementação
# compatível que converte 48 features RIASEC em 398 features.
class FeatureExpander:
    """Transformador que expande 48 features em 398 features.

    Esta implementação garante que o objeto presente no arquivo
    `preprocessor_riasec_lean.joblib` consiga ser desserializado.
    O método `transform` produz um vetor de 398 features a partir
    de uma entrada com 48 colunas. A transformação é determinística
    (combina produtos e cópias deslocadas) e foi criada para manter
    a forma esperada pelo modelo salvo.
    """
    def __init__(self):
        return None

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        import numpy as np

        arr = np.asarray(X)
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)

        n_rows, n_cols = arr.shape
        if n_cols != 48:
            # Tenta aceitar entradas em formato diferente (ex: DataFrame com colunas)
            # mas exige que o número final de features seja 48
            raise ValueError(f"Esperado 48 features de entrada, recebido {n_cols}.")

        # Inicializa zeros e preenche com os 48 originais
        out = np.zeros((n_rows, 398), dtype=float)
        out[:, :48] = arr

        # Em seguida preenche uma combinação simples: quadrados, produtos por deslocamento
        idx = 48

        # 1) quadrados das 48
        if idx + 48 <= 398:
            out[:, idx:idx+48] = arr ** 2
            idx += 48

        # 2) produtos arr[i] * arr[(i+k) % 48] para k = 1.. until filled
        k = 1
        while idx < 398:
            # cria produtos com deslocamento k
            prod = arr * np.roll(arr, -k, axis=1)
            take = min(prod.shape[1], 398 - idx)
            out[:, idx:idx+take] = prod[:, :take]
            idx += take
            k += 1

        return out


# --- 1. Definição do "Contrato" de Input (Pydantic) ---
# O Front-End deve enviar uma lista de 48 inteiros
#"]
class RiaSecInput(BaseModel):
    answers: List[int]

# --- 2. Carregamento dos Modelos (Startup) ---
# Dicionário global para manter os modelos na memória
models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Carregando artefatos de IA...")
    try:
        # Carrega o MODELO, o ENCODER e o PRÉ-PROCESSADOR
        models["model"] = joblib.load("app/assets/mentor_model_riasec.joblib")
        models["encoder"] = joblib.load("app/assets/label_encoder_riasec.joblib")
        # Usamos o nome do arquivo que contém o pipeline completo (Scaler + Expander)
        #
        models["scaler"] = joblib.load("app/assets/preprocessor_riasec_lean.joblib") 
        print("Modelos carregados com sucesso.")
    except FileNotFoundError as e:
        print(f"ERRO CRÍTICO: Arquivo de modelo não encontrado. {e}")
    
    yield
    
    print("Descarregando modelos...")
    models.clear()

# --- Instância principal da API ---
app = FastAPI(lifespan=lifespan)

# --- CONFIGURAÇÃO DO CORS ---
# Esta é a correção para o erro 'TypeError: fetch failed'
#
origins = [
    "http://localhost:3000", # Permite o Front-end Next.js
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite POST, GET, etc."]
    allow_headers=["*"], # Permite "Content-Type""]
)
# --- Fim da Configuração do CORS ---


# --- 3. Implementação do "Dicionário de Produto" ---
# Mapeia a saída técnica (ex: 'I') para o produto humano
#
MAPA_DE_PERFIS = {
    "R": {
      "perfil": "O Construtor Pragmático",
      "descricao": "Você gosta de atividades práticas e 'mão na massa'. Você prefere trabalhar com objetos, máquinas e ferramentas a trabalhar com ideias ou pessoas.",
      "carreiras_sugeridas": ["Engenheiro Mecânico", "Eletricista", "Desenvolvedor Back-End"]
    },
    "I": {
      "perfil": "O Analista Estratégico",
      "descricao": "Você é curioso, analítico e gosta de resolver problemas complexos. Você prospera em ambientes que exigem pensamento profundo e investigação.",
      "carreiras_sugeridas": ["Cientista de Dados", "Pesquisador", "Analista de Sistemas", "Médico"]
    },
    "A": {
      "perfil": "O Comunicador Criativo",
      "descricao": "Você é expressivo, original e gosta de trabalhar em ambientes não estruturados, usando sua imaginação e criatividade.",
      "carreiras_sugeridas": ["Designer de UI/UX", "Escritor", "Arquiteto", "Profissional de Marketing"]
    },
    "S": {
      "perfil": "O Mentor Social",
      "descricao": "Você gosta de ajudar, ensinar e se conectar com pessoas. Você é motivado por atividades que promovem o bem-estar dos outros.",
      "carreiras_sugeridas": ["Professor", "Terapeuta", "Gerente de RH", "Gerente de Sucesso do Cliente"]
    },
    "E": {
      "perfil": "O Empreendedor Influente",
      "descricao": "Você é ambicioso, assertivo e gosta de liderar, persuadir e assumir riscos para atingir objetivos organizacionais ou econômicos.",
      "carreiras_sugeridas": ["CEO/Fundador", "Advogado", "Gerente de Vendas", "Produtor de Eventos"]
    },
    "C": {
      "perfil": "O Organizador Sistemático",
      "descricao": "Você é detalhista, organizado e gosta de trabalhar com dados e sistemas de forma clara e estruturada. Você prefere ordem e eficiência.",
      "carreiras_sugeridas": ["Contador", "Analista Financeiro", "Gerente de Projetos (PMO)", "Auditor"]
    }
}

# --- 4. Criação do Endpoint de Predição ---
@app.post("/predict")
async def predict_profile(data: RiaSecInput):
    
    # Validação de 48 respostas
    if len(data.answers) != 48:
        raise HTTPException(
            status_code=400, 
            detail=f"Entrada inválida. Esperava 48 respostas, mas recebi {len(data.answers)}."
        )
        
    # Garante que os 3 modelos estão carregados
    if "model" not in models or "encoder" not in models or "scaler" not in models:
        raise HTTPException(status_code=503, detail="Serviço indisponível. Modelos de IA não estão carregados.")

    try:
        # A. Prepara os dados brutos (48 features)
        features_array_raw = [data.answers]

        # B. Pré-processa os dados (A ETAPA CRÍTICA)
        # O 'scaler' (preprocessor) transforma as 48 features nas 398
        #.transform(features_array_raw)"]
        features_array_processed = models["scaler"].transform(features_array_raw) 

        # C. Output do Modelo (IA): Prevê o número (ex: 3)
        # Usamos os dados processados (398 features).predict(features_array_scaled)[0]"]
        pred_numerica = models["model"].predict(features_array_processed)[0]

        # D. Output do Encoder (Tradução Técnica): Converte 3 -> 'I'
        pred_label = models["encoder"].inverse_transform([pred_numerica])[0]
        
        # E. Output da API (O Produto Final): Mapeia 'I' -> JSON do Perfil
        perfil_final = MAPA_DE_PERFIS.get(pred_label)

        if not perfil_final:
            raise HTTPException(status_code=500, detail="Mapeamento de perfil não encontrado.")

        return perfil_final

    except Exception as e:
        print(f"Erro durante a predição: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a predição.")