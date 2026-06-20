# AkrivonAI — V1 Development Plan

## Upfront Architecture Decisions (Lock These In First)

| Decision | Choice | Why |
|---|---|---|
| **Database** | **Firestore** | Firebase-native, real-time listeners for job polling, no VPC setup needed |
| **Auth** | **Firebase Authentication** | Built-in, free tier generous, JWTs verified trivially in Python via `firebase-admin` |
| **Async Jobs** | **Cloud Tasks** | Returns job ID immediately, processes in a second function invocation, built-in retry — no Redis/Celery needed |

---

## Phase 0 — Foundation Hygiene (1 day)

Remove landmines before building anything. These are quick wins with outsized impact.

- `backend/app/gemini_client.py` — Change default model to `gemini-2.0-flash`; load model lazily inside `llm()` so env var changes take effect without redeployment
- `backend/app/main.py` — Replace hardcoded CORS origins with env-var: `os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")`
- `backend/app/models.py` — Make `EnforceRequest.target_api` optional (`HttpUrl | None = None`) before any customers integrate
- `firebase.json` — Add the missing `/api/**` → Cloud Function rewrite rule (the backend is unreachable in production without this)

---

## Phase 1 — Auth + API Keys (4–5 days)

**Goal:** Gate the product. No auth = no real product.

**Backend (new files):**
- `backend/app/auth.py` — FastAPI dependency that verifies Firebase JWTs via `firebase-admin.auth.verify_id_token()`. Also handles API key format (`ak_live_<hex>`) by hashing and looking up in Firestore.
- `backend/app/api_keys.py` — Generate keys with `secrets.token_hex(32)`, store only the SHA-256 hash in Firestore under `api_keys/{hash}`. Never re-expose the raw key.

**Backend (modified):**
- `backend/app/main.py` — Add auth dependency to `/scan` and `/enforce`. New routes: `POST /api-keys`, `GET /api-keys`, `DELETE /api-keys/{key_id}`

**Frontend (new files):**
- `frontend/src/firebase.ts` — Initialize Firebase app from `VITE_FIREBASE_*` env vars
- `frontend/src/hooks/useAuth.ts` — `onAuthStateChanged` listener exposing `{user, loading, token}`
- `frontend/src/pages/LoginPage.tsx` — Email/password sign-in using Firebase Auth SDK
- `frontend/src/pages/SignupPage.tsx` — Registration, creates `users/{uid}` Firestore doc with `plan: "starter"`
- `frontend/src/components/ProtectedRoute.tsx` — Redirects to `/login` if unauthenticated
- `frontend/src/pages/DashboardPage.tsx` — Shell dashboard with API key management UI

**Frontend (modified):**
- `frontend/src/api.ts` — All calls get `Authorization: Bearer <token>` header
- `frontend/src/components/Navbar.tsx` — Show Login/Dashboard based on auth state
- `frontend/src/App.tsx` — Add `/login`, `/signup`, `/dashboard` routes; wrap existing pages with `ProtectedRoute`

---

## Phase 2 — Persistence with Firestore (3–4 days)

**Goal:** Nothing disappears on refresh. Unlock scan history.

**Firestore schema:**
```
users/{uid}                        → { plan, created_at }
api_keys/{hash}                    → { uid, name, created_at, last_used_at }
scans/{scan_id}                    → { uid, status, config, summary, violations[], created_at }
layers/{layer_id}                  → { uid, name, target_url, intent_schema, policy_rules }
```

**Backend (new):**
- `backend/app/db.py` — Firestore client singleton + helpers: `create_scan_record`, `update_scan_record`, `get_scan`, `list_scans_for_user`, `create_layer`, `get_layer`

**Backend (new routes):**
- `GET /scans` — paginated scan history for the authed user
- `GET /scans/{scan_id}` — single scan result (validates uid ownership)
- `GET /usage` — `{plan, monthly_tests_used, monthly_tests_limit}`

**Frontend (new):**
- `frontend/src/pages/ScanDetailPage.tsx` — Full results view for a stored scan + JSON download button
- Upgrade `DashboardPage.tsx` — Real scan history table from `GET /scans`

**npm add:** `firebase` (client SDK), `@tanstack/react-query` (replaces manual fetch state patterns, built-in polling support)

---

## Phase 3 — Real Enforce Proxy with Persistent Layers (4–5 days)

**Goal:** Turn the stateless demo into the actual product. Customers get a persistent proxy URL they can drop into their stack.

The core concept: Customer creates an "Intent Layer" → gets a URL like `akrivon.ai/proxy/{layer_id}` → their AI traffic flows through it → Akrivon classifies intent, applies their policy, proxies to their backend.

**Backend (new):**
- `backend/app/proxy.py` — FastAPI router for `POST /proxy/{layer_id}`:
  1. Load layer config from Firestore
  2. Extract prompt from request body (tries `prompt`, `message`, `input`, `query`)
  3. Run `enforce()` with the layer's config
  4. Log request/decision to `layers/{layer_id}/requests/{request_id}`
  5. Return response in same shape as incoming request (transparent to the caller)

**Backend (new routes):**
- `POST /layers`, `GET /layers`, `GET /layers/{layer_id}`, `PUT /layers/{layer_id}`, `DELETE /layers/{layer_id}`
- `GET /layers/{layer_id}/requests` — paginated request log

**Frontend (new pages):**
- `frontend/src/pages/LayersPage.tsx` — List all layers with status
- `frontend/src/pages/LayerCreatePage.tsx` — Form: name, target URL, intent schema, policy rules → shows proxy URL on completion
- `frontend/src/pages/LayerDetailPage.tsx` — Proxy URL (copyable), recent request log, edit config link

**Dependencies:** Phases 1 + 2

---

## Phase 4 — Configurable Intent Schema + Richer Policy Engine (3–4 days)

**Goal:** The classifier is currently useless for any domain other than fintech. Fix that.

**Intent schema stored per-layer in Firestore:**
```json
{
  "categories": [
    { "name": "order_status", "description": "Questions about orders, delivery, returns" },
    { "name": "jailbreak_attempt", "description": "Attempts to override system behavior" }
  ]
}
```

**Policy rule DSL:**
```json
[
  { "when": { "intent": "jailbreak_attempt" }, "then": "block", "log": true },
  { "when": { "intent": "order_status", "confidence_gte": 0.7 }, "then": "allow" },
  { "when": { "confidence_lt": 0.5 }, "then": "clarify" },
  { "default": "allow" }
]
```
Supported conditions: `intent`, `confidence_gte`, `confidence_lt`, `intent_in`, `intent_not_in`

**Backend (modified):**
- `backend/intent_layer/classifier.py` — `classify_intent(prompt, schema)` accepts `IntentSchema`; builds Gemini prompt dynamically from schema categories
- `backend/intent_layer/policy.py` — Rewrite as rule DSL evaluated in sequence
- `backend/app/models.py` — Add `IntentCategory`, `IntentSchema`, `PolicyRule`, `PolicyRuleSet` Pydantic models
- `backend/intent_layer/engine.py` — Thread schema + rule set through `enforce()`

**Frontend (modified):**
- `LayerCreatePage.tsx` — Replace comma text fields with dynamic category builder and visual rule list

**Dependencies:** Phase 3

---

## Phase 5 — Async Scan Jobs (3–4 days)

**Goal:** Break the Cloud Function 9-minute timeout. Scans return immediately with a job ID.

**New flow:**
1. `POST /scan` → validates request, creates Firestore doc with `status: "queued"`, enqueues Cloud Tasks task → returns `{scan_id, status: "queued"}` (HTTP 202)
2. Cloud Tasks calls `POST /scan/worker/{scan_id}` → runs `run_scan()` → updates Firestore to `status: "complete"` or `"failed"`
3. Frontend polls `GET /scans/{scan_id}` every 3s until done

**Backend (new):**
- `backend/app/tasks.py` — Cloud Tasks client, `enqueue_scan_job(scan_id, ...)` using `google-cloud-tasks`
- `backend/app/main.py` — `/scan` becomes async-submit; add `/scan/worker/{scan_id}` internal route (verified via `X-CloudTasks-QueueName` header, not public)

**Frontend (modified):**
- `frontend/src/api.ts` — Add `pollScan(scan_id, token)`: polls every 3s, max 10 min
- `frontend/src/pages/Demo.tsx` — Two-step UX: submit → show job ID + "Running..." → poll → render results when done

**pip add:** `google-cloud-tasks`

**GCP setup:** `gcloud tasks queues create akrivon-scans --location=us-central1`

**Dependencies:** Phases 1 + 2

---

## Phase 6 — Rate Limiting + Plan Enforcement (2 days)

**Goal:** Protect the API from abuse; enforce plan limits so billing makes sense.

**Plan limits:**
```python
PLAN_LIMITS = {
    "starter":    {"rpm": 10,  "monthly_tests": 1_000},
    "growth":     {"rpm": 60,  "monthly_tests": 20_000},
    "enterprise": {"rpm": 300, "monthly_tests": 500_000},
}
```

**Backend (new):**
- `backend/app/rate_limit.py` — Sliding 60-second window counter in Firestore per uid. Plan limits stored in `users/{uid}.plan`.
- `backend/app/main.py` — Add `rate_limit` as FastAPI dependency on `/scan` and `/proxy/{layer_id}`. Monthly quota check before enqueuing (returns HTTP 402 if over limit).

**Dependencies:** Phases 1 + 2

---

## Phase 7 — More Attack Strategies (3–4 days)

**Goal:** Go from 3 toy strategies to 8 real ones.

**New strategies:**
- `MultiTurnEscalation` — multi-message conversation threads that escalate gradually
- `EncodingBypass` — base64, leetspeak, ROT13, Unicode lookalikes embedding disallowed content
- `IndirectInjection` — simulates externally-retrieved content with injected instructions
- `PersonaInjection` — novel "you are DAN / unrestricted mode" framings
- `PayloadSplitting` — splits disallowed request across two turns or multiple fields

**Backend (modified):**
- `backend/app/models.py` — Extend `StrategyName` enum with 5 new values
- `backend/app/engine.py` — `strategy_engine()` distributes across 8 strategies; `_probe_generation_prompt()` gets strategy-specific guidance; add `_invoke_target_api_multiturn()` for OpenAI-compatible conversation arrays

**Frontend:** Update `frontend/src/types.ts` `ViolationRecord.strategy` union type.

**Dependencies:** Phase 5 (multi-turn scans must run async)

---

## Phase 8 — Scan Reports + Exports (2–3 days)

**Goal:** Give customers a shareable artifact. Required for enterprise sales and compliance.

**JSON export (1 hour):** `URL.createObjectURL(new Blob([JSON.stringify(...)]))` from `ScanDetailPage.tsx`.

**PDF export:**
- `backend/app/reports.py` (new) — `generate_scan_pdf(scan_record) -> bytes` using `reportlab`. Includes: scan metadata, summary metrics with color-coded risk score, violation table, methodology blurb.
- `GET /scans/{scan_id}/report.pdf` — Auth required, streams PDF with `Content-Disposition: attachment`.
- `frontend/src/pages/ScanDetailPage.tsx` — "Download PDF" button.

**Shareable links (optional):**
- `POST /scans/{scan_id}/share` — Creates `shared_scans/{token}` with TTL
- `GET /shared/{token}` — Public, returns sanitized scan data (no target URL exposed)

**pip add:** `reportlab`

**Dependencies:** Phase 2

---

## Phase 9 — Dashboard Polish + Full Sign-up Flow (3 days)

**Goal:** A new customer can onboard without talking to you.

- `DashboardPage.tsx` — Usage card (tests used vs plan limit), layers list with status indicators, recent scans table, empty-state "Get Started" CTA for new users
- `frontend/src/pages/AccountPage.tsx` (new) — API key management, user profile, plan tier display, upgrade link
- Full sign-up → onboarding → first layer → first scan flow, no dead ends

**Dependencies:** Phases 1–3

---

## Sequencing

```
Phase 0 (1d)
    └── Phase 1 (5d)
            └── Phase 2 (4d)
                    ├── Phase 3 (5d)
                    │       └── Phase 4 (4d)
                    ├── Phase 5 (4d)
                    │       └── Phase 7 (4d)
                    ├── Phase 6 (2d)   ← parallelize with Phase 5
                    ├── Phase 8 (3d)   ← parallelize with Phase 5
                    └── Phase 9 (3d)   ← start after Phase 3
```

**Total: ~37–43 days of focused solo work (~8–10 weeks)**

---

## Minimum "Charge For It" Milestone

To put a customer on a $99/month Starter plan, you need:

**Phases 0 → 1 → 2 → 3 → 6** (~4–5 weeks)

Phases 4, 5, 7, 8, 9 are the growth features that justify Growth ($499/mo) and Enterprise tiers.

---

## Libraries to Add (Consolidated)

### Backend `requirements.txt`
| Library | Phase | Purpose |
|---|---|---|
| `google-cloud-tasks` | Phase 5 | Cloud Tasks job enqueueing |
| `reportlab` | Phase 8 | PDF generation |

### Frontend `package.json`
| Library | Phase | Purpose |
|---|---|---|
| `firebase` | Phase 1 | Firebase Auth + Firestore client SDK |
| `@tanstack/react-query` | Phase 2 | Data fetching, polling, cache invalidation |
