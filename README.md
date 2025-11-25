# 🎯 Mentora Digital

> Uma aplicação web moderna para **descobrir seu perfil de carreira** através do teste RIASEC (Holland Codes), com **backend robusto em FastAPI** e **frontend elegante em Next.js**.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-24.11.1-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black.svg)

---

## 📋 Sobre

**Mentora Digital** é uma plataforma interativa que ajuda usuários a identificar seu perfil profissional ideal respondendo 48 perguntas estruturadas baseadas na metodologia **RIASEC** (Realista, Investigativo, Artístico, Social, Empreendedor, Convencional).

### Características principais

- ✅ **Teste RIASEC completo** com 6 blocos de 8 perguntas cada
- ✅ **Barra de progresso** visual durante o teste
- ✅ **Sugestões de carreira** personalizadas baseadas no perfil detectado
- ✅ **Design responsivo** com Tailwind CSS e fonte customizada (Montserrat)
- ✅ **API RESTful** com carregamento automático de modelos de IA
- ✅ **CORS configurado** para comunicação segura frontend-backend
- ✅ **Cores customizadas** e identidade visual coesa

---

## 🚀 Quick Start

### Pré-requisitos

- **Python 3.13+** (com pip)
- **Node.js 24.11+** (com npm)
- **Git**

### Backend (FastAPI)

```bash
cd backend_api

# Criar e ativar ambiente virtual
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows PowerShell

# Instalar dependências
pip install -r requirements.txt

# Rodar servidor
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Acesso: `http://127.0.0.1:8000/docs` (Swagger UI)

### Frontend (Next.js)

```bash
cd frontend_app

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesso: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
mentor-digital/
├── backend_api/
│   ├── app/
│   │   ├── main.py              # API FastAPI com endpoint /predict
│   │   ├── assets/              # Modelos treinados (.joblib)
│   │   │   ├── mentor_model_riasec.joblib
│   │   │   ├── label_encoder_riasec.joblib
│   │   │   └── preprocessor_riasec_lean.joblib
│   │   └── __init__.py
│   ├── create_preprocessor.py   # Script para criar preprocessor
│   ├── requirements.txt         # Dependências Python
│   └── .venv/                   # Ambiente virtual (não versionado)
│
├── frontend_app/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Layout raiz com fonte Montserrat
│   │   │   ├── page.tsx         # Home page
│   │   │   └── globals.css      # Estilos globais + Tailwind
│   │   ├── components/
│   │   │   ├── ConversationalForm.tsx   # Gerencia fluxo do teste
│   │   │   ├── QuestionBlock.tsx        # Renderiza bloco de 8 perguntas
│   │   └── lib/
│   │       └── api.ts           # Cliente para chamar backend
│   ├── public/                  # Favicon e assets estáticos
│   ├── tailwind.config.ts       # Config Tailwind com cores customizadas
│   ├── postcss.config.cjs       # PostCSS com Tailwind plugin
│   ├── package.json             # Dependências Node.js
│   └── node_modules/            # Pacotes npm (não versionado)
│
├── README.md                    # Este arquivo
├── PRODUCT_DESCRIPTION.md       # Descrição técnica do produto
└── .gitignore                   # Exclusões Git
```

---

## 🔧 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  - 48 perguntas em 6 blocos                             │
│  - Barra de progresso                                   │
│  - Cores: #333f70, #79ddf5, #66b7fe, #cbf8f5          │
└────────────────────┬────────────────────────────────────┘
                     │ POST /predict
                     │ [48 respostas]
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                      │
│  1. Recebe 48 inteiros                                  │
│  2. Preprocessa (48 → 398 features)                     │
│  3. Prediz com modelo treinado                          │
│  4. Decodifica rótulo numérico → letra (R/I/A/S/E/C)  │
│  5. Mapeia para perfil descritivo                       │
└────────────────────┬────────────────────────────────────┘
                     │ JSON {perfil, descricao, carreiras}
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Frontend exibe resultado                       │
│           - Perfil: "O Comunicador Criativo"            │
│           - Carreiras sugeridas                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Dependências

### Backend
- **FastAPI** — Framework web assíncrono
- **Uvicorn** — Servidor ASGI
- **Scikit-learn** — Modelos de ML e preprocessamento
- **Joblib** — Serialização de modelos
- **XGBoost** — Modelo de predição
- **Pandas** — Manipulação de dados

### Frontend
- **Next.js 16.0.3** — Framework React com SSR
- **React 19.2.0** — Biblioteca UI
- **TypeScript 5** — Tipagem estática
- **Tailwind CSS 4** — Utilitários CSS
- **Montserrat** — Fonte customizada (Google Fonts)

---

## 🎨 Design & Cores

| Cor | Código | Uso |
|-----|--------|-----|
| Azul Escuro | `#333f70` | Texto principal |
| Azul Claro | `#79ddf5` | Barra de progresso, hover |
| Azul Médio | `#66b7fe` | Botões |
| Azul Pastel | `#cbf8f5` | Fundo dos blocos de perguntas |

---

## 🐛 Troubleshooting

### "ERR_CONNECTION_REFUSED" no navegador
```powershell
# Verifique portas em uso
netstat -ano | Select-String ":8000"

# Libere a porta (se necessário)
taskkill /PID <pid> /F

# Reinicie backend em porta alternativa
python -m uvicorn app.main:app --port 8010
```

### Cache Tailwind desatualizado
```powershell
cd frontend_app
Remove-Item -Recurse -Force .next
npm run dev
```

### Erro "Can't get attribute 'FeatureExpander'"
- Solução já implementada: classe `FeatureExpander` foi adicionada em `backend_api/app/main.py` para compatibilidade com pickle.

---

## 📚 Documentação Adicional

- **[PRODUCT_DESCRIPTION.md](./PRODUCT_DESCRIPTION.md)** — Detalhes técnicos, versões, e decisões de arquitetura
- **Swagger API:** `http://127.0.0.1:8000/docs` (quando backend está rodando)

---

## 🔐 Segurança & Boas Práticas

⚠️ **Nota importante:** O `FeatureExpander` é uma implementação de compatibilidade. Para produção, recomenda-se:

1. Reexportar o preprocessor em formato neutro (ONNX, JSON)
2. Adicionar validação de checksums para artefatos `.joblib`
3. Usar variáveis de ambiente para URLs de API
4. Implementar autenticação/autorização

---

## 🚢 Deployment (Próximas Fases)

- [ ] Containerização com Docker
- [ ] CI/CD com GitHub Actions
- [ ] Deploy no Vercel (frontend) / Railway (backend)
- [ ] Testes automatizados (pytest, Jest)
- [ ] Monitoramento (Sentry, LogRocket)

---

## 📞 Suporte & Contribuições

- **Issues**: Abra uma issue descrevendo o problema
- **PRs**: Contribuições são bem-vindas! Siga o padrão existente
- **Email**: [pallomaruysa@gmail.com](mailto:pallomaruysa@gmail.com)

---

## 📄 Licença

Este projeto está sob licença **MIT**. Veja [LICENSE](./LICENSE) para detalhes.

---

**Feito com ❤️ para ajudar você a descobrir seu caminho profissional.**
