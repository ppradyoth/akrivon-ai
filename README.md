# AkrivonAI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-ppradyoth%2Fakrivon--ai-181717?style=for-the-badge&logo=github)](https://github.com/ppradyoth/akrivon-ai)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![AI Engine: Gemini](https://img.shields.io/badge/AI--Engine-Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini)

AI boundary testing and runtime enforcement platform.

AkrivonAI gives teams two tools for keeping deployed AI systems within their intended scope:

- **IntentScan** — automated red-team testing that generates adversarial probes against any AI API and scores boundary violations
- **IntentEnforce** — a runtime proxy layer that classifies user intent and applies allow/block policy before requests reach your AI

---

## How It Works

### IntentScan

Point IntentScan at any AI API endpoint. Describe what the model is supposed to do, what it's allowed and disallowed to do, and how many tests to run. It will:

1. Generate adversarial prompts using three strategies — **Role Transformation**, **Gradual Drift**, and **Language Variation**
2. Fire those probes at your API
3. Analyze each response with an LLM judge to detect violations (capability drift, role drift, domain violation)
4. Return a risk score (0–100) and a detailed violation report

### IntentEnforce

Sit IntentEnforce in front of your AI as a proxy. On each incoming request it:

1. Classifies the user's intent via LLM
2. Checks it against your configured allow/block list
3. Routes the request through, blocks it, or asks for clarification

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| LLM | Google Gemini (`gemini-pro` by default) |
| Frontend | React, TypeScript, Vite |
| Hosting | Firebase Hosting + Cloud Functions |

---

## Local Development

### Prerequisites

- Python 3.11
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set GEMINI_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:8000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-pro` | Gemini model to use |
| `INTENT_TARGET_API_URL` | No | — | Default target URL for `/enforce` if not provided in the request |

---

## API

### `POST /scan`

Run an IntentScan against a target AI API.

```json
{
  "api_url": "https://your-ai-api.example.com/chat",
  "use_case": "A customer support assistant for a SaaS product. It answers questions about billing, account management, and product features.",
  "allowed_capabilities": ["billing questions", "account help", "feature explanations"],
  "disallowed_capabilities": ["investment advice", "legal advice", "writing code"],
  "languages": ["English"],
  "num_tests": 20
}
```

Response includes a `risk_score` (0–100), total violations count, and a full list of violation records with the probe, response, violation type, severity, and confidence.

### `POST /enforce`

Classify and route a single prompt through the intent enforcement layer.

```json
{
  "prompt": "Can you help me set up a Stripe webhook?",
  "target_api": "https://your-ai-api.example.com/chat",
  "config": {
    "allowed": ["payments_api_help", "general_coding"],
    "blocked": ["financial_advice"]
  }
}
```

Response includes the detected intent label, confidence, decision (`allow` / `block` / `clarify`), and the final response.

---

## Deployment

The backend deploys as a Firebase Cloud Function. Firebase Hosting serves the frontend and rewrites `/api/**` to the function.

```bash
# Build frontend
cd frontend && npm run build

# Deploy
firebase deploy
```

The `GEMINI_API_KEY` must be set as a Firebase Secret before deploying:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```
