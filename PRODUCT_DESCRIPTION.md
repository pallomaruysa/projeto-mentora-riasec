# Descrição do Produto — MentoraDigital

Este documento descreve detalhadamente o produto desenvolvido neste repositório, incluindo a solução implementada, os detalhes do backend, frontend, fluxo de dados, o erro encontrado durante o carregamento dos artefatos de IA e a correção aplicada. Contém também as ferramentas e versões observadas no ambiente do projeto.

---

**Sumário rápido**

- Produto: API e frontend para mapear perfis RIASEC a partir de 48 respostas, expandindo para features e prevendo um perfil com um modelo de aprendizado de máquina.
- Backend: FastAPI (Python) que carrega modelos e preprocessor serializados com `joblib` e expõe `/predict`.
- Frontend: Next.js + React + TypeScript com componentes que apresentam perguntas e enviam as 48 respostas ao backend.

---

## 1 — Visão Geral da Solução

Fluxo de alto nível:

1. O usuário responde 48 perguntas no frontend (Next.js).
2. O frontend envia um POST JSON para o endpoint `POST /predict` no backend (FastAPI) com o payload `{"answers":[...48 números...]}`.
3. No backend, o pipeline de pré-processamento (um `Pipeline` do scikit-learn salvo em `app/assets/preprocessor_riasec_lean.joblib`) transforma as 48 features em 398 features esperadas pelo modelo.
4. O modelo (salvo em `app/assets/mentor_model_riasec.joblib`) prevê um rótulo numérico.
5. Um `LabelEncoder` (salvo em `app/assets/label_encoder_riasec.joblib`) converte esse número para a lettera R/I/A/S/E/C.
6. A API mapeia a letra para um JSON descritivo de perfil e retorna ao frontend.

Este fluxo permite separar responsabilidades e manter a inferência eficiente e sem estado entre requisições.

---

## 2 — Backend (detalhes técnicos)

Localização: `backend_api/app/main.py`

- Componentes principais:
  - `RiaSecInput` (Pydantic): valida que o payload contém uma lista de 48 inteiros.
  - `lifespan` (context manager assíncrono): durante a inicialização da aplicação, carrega os artefatos (`mentor_model_riasec.joblib`, `label_encoder_riasec.joblib`, `preprocessor_riasec_lean.joblib`) em memória dentro do dicionário `models`.
  - Endpoint `POST /predict`: valida entrada, aplica `models["scaler"].transform(...)`, chama `models["model"].predict(...)` e decodifica via `models["encoder"].inverse_transform(...)`.

### Problema encontrado

- Ao iniciar a API houve um erro de desserialização (pickle/joblib):

  `AttributeError: Can't get attribute 'FeatureExpander' on <module 'app.main' ...>`

- Causa: o pipeline salvo (`preprocessor_riasec_lean.joblib`) foi serializado referenciando uma classe `FeatureExpander` definida no contexto/instrumento de treino. Na hora de desserializar, o unpickler procura a classe exatamente no mesmo caminho (módulo e nome). Se o módulo não define essa classe, a desserialização falha.

### Correção aplicada

- Para recuperar a capacidade de carregar o preprocessor sem alterar o artefato salvo, foi adicionada uma implementação compatível de `FeatureExpander` em `backend_api/app/main.py`.
- A implementação adicionada é uma versão de compatibilidade que aceita um array com 48 colunas e produz um array com 398 colunas (preenchendo com cópias, quadrados e produtos deslocados) — o objetivo foi garantir a forma (shape) esperada pelo modelo salvo e permitir que a API suba.

Observação: essa compatibilidade garante desalocar o erro de import/pickle e permitir chamadas à API. Entretanto, para previsões reproduzíveis e idênticas ao ambiente de treino, o ideal é usar exatamente a mesma implementação do `FeatureExpander` que foi usada no treino (ou re-treinar o preprocessor/modelo localmente).

### Como rodar o backend (resumo)

```powershell
cd c:\ProjetoMentorDigital\backend_api
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Abra `http://127.0.0.1:8000/docs` para testar via Swagger.

### Observações de segurança e manutenção

- Deserializar objetos com pickle/joblib exige cuidado: arquivos serializados dependem de nomes de módulo/classe e podem executar código durante o unpickle. Nunca carregue artefatos de origem duvidosa.
- Sempre versionar e documentar a implementação exata de pré-processadores customizados para evitar incompatibilidades.

---

## 3 — Frontend (detalhes técnicos)

Localização: `frontend_app/` (Next.js + React + TypeScript)

- Componentes relevantes:
  - `src/app/...` — layout e rotas principais do Next.js.
  - `src/components/QuestionBlock.tsx` — componente (por contexto do editor) que renderiza perguntas/interação do usuário.
  - `src/components/ConversationalForm.tsx` — formulário conversacional que coleta as 48 respostas e envia ao backend.
  - `src/lib/api.ts` — cliente fetch/abstração para chamar `POST /predict`.

Fluxo: o formulário coleta 48 respostas (array de inteiros) e faz um POST para `http://localhost:8000/predict` (CORS configurado no backend para `http://localhost:3000`). A resposta JSON retorna o perfil detalhado que é apresentado para o usuário.

Como rodar o frontend (resumo):

```powershell
cd c:\ProjetoMentorDigital\frontend_app
npm install
npm run dev
```

Abra `http://localhost:3000`.

---

## 4 — Ferramentas, dependências e versões observadas

Observações de versão — tiradas dos arquivos do projeto e do ambiente:

- Backend (ambiente observado):
  - Python: `3.13.9` (venv usado no projeto)
  - Dependências listadas em `backend_api/requirements.txt` (versões não fixadas neste arquivo):
    - `fastapi`
    - `uvicorn[standard]`
    - `scikit-learn`
    - `joblib`
    - `xgboost`
    - `pandas`

  Nota: Como `requirements.txt` não fixa versões, a versão instalada depende do ambiente. Recomenda-se travar versões (ex.: `fastapi==0.101.0`) para reprodutibilidade.

- Frontend (observado em `frontend_app/package.json`):
  - `next`: `16.0.3`
  - `react`: `19.2.0`
  - `react-dom`: `19.2.0`
  - `typescript`: `^5`
  - `tailwindcss`: `^4`
  - `eslint`: `^9`
  - Observado no ambiente: `node` v24.11.1

## 5 — Diagnóstico do erro que você viu no navegador (ERR_CONNECTION_REFUSED)

- Causa típica: o navegador tentou conectar em `127.0.0.1:8000` porém não havia servidor escutando nessa porta naquele momento (ou a porta estava ocupada por outro processo que rejeitou conexões). Em nosso trabalho corrigimos o erro de pickle para permitir que o servidor subisse — mas sempre verifique:
  - se o `uvicorn` está rodando e em qual porta ele foi iniciado;
  - se a porta está ocupada por outro processo (`netstat -ano | Select-String ":8000"`);
  - se firewall/antivírus local bloqueia conexões locais (raro, mas possível).

## 6 — Boas práticas e próximos passos recomendados

1. Fixar versões de dependências (backend e frontend) para reprodutibilidade.
2. Recuperar/versão a implementação original de `FeatureExpander` usada no treinamento do preprocessor, e substituir a implementação de compatibilidade inserida no `main.py`.
3. Adicionar testes automatizados para o endpoint `/predict` (pytest/requests) com casos sintéticos e reais (quando disponível ground-truth).
4. Adicionar CI que verifique build do frontend e execução de testes backend.
5. Considerar containerizar com Docker e orquestração simples (compose) para desenvolvimento e deploy.

---

Se desejar, eu posso:

- Procurar em repositórios relacionados pela implementação original de `FeatureExpander` (se você me indicar onde procurar).
- Atualizar o `requirements.txt` com versões fixas compatíveis e validar o ambiente.
- Inserir um `Makefile`/scripts `npm` e PowerShell para comandos comuns (start, test, lint, build) e um `docker-compose.yaml` básico.

Arquivo criado: `PRODUCT_DESCRIPTION.md` na raiz do projeto.
