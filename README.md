# PrepPilot — AI-Powered Personalized SDE Interview Coach

```
React (Vite) frontend  →  Express API  →  services  →  MongoDB
                                             ↓
                                          Gemini AI
```

## 1. Configure the backend

Keep your existing `backend/.env` and make sure it has these variables (see `backend/.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | yes | MongoDB Atlas / local connection string |
| `GEMINI_API_KEY` | yes | Gemini API key |
| `JWT_SECRET` | **yes (new)** | long random string; generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `PORT` | no | default `5000` |
| `GEMINI_MODEL` | no | default `gemini-3.5-flash-lite` |
| `JWT_EXPIRES_IN` | no | default `7d` |
| `MAX_PLAN_DAYS` | no | max days generated per plan, default `21` |

Without `JWT_SECRET` the backend still starts in development with an insecure fallback secret and prints a warning.

## 2. Run

```bash
# terminal 1
cd backend
npm install
npm run dev          # http://localhost:5000

# terminal 2
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api`. If yours differs, copy `frontend/.env.example` to `frontend/.env` and edit `VITE_API_BASE_URL`.

## 3. Demo script (brand-new account)

1. **Sign up** with a new email (password ≥ 8 characters) — you are sent to onboarding.
2. **Onboarding**: all steps are pre-filled with sensible defaults; adjust role / interview date / hours / study days, then **Create My Plan** (Gemini builds it; can take up to a minute).
3. **Dashboard**: plan version, today's focus, planned vs actual time, readiness, plan health (overall vs expected, deviation severity, suggested action).
4. **Today's Plan**: mark tasks Done / Partial / Skipped / reset, record time. Progress, deviation and the dashboard update immediately.
5. **Trigger the adaptive loop**: skip or half-finish a few tasks, open the **Dashboard → Analyze my progress**. Gemini answers CONTINUE, ADJUST (a catch-up session is added to your schedule) or REPLAN.
6. **New plan version**: **Replan with AI** creates Plan v2 (v1 is archived). See it under **My Plan → Version history**, with the reason and a v1 → v2 comparison.
7. **Settings**: change name / email / goal / availability (persisted). After changing goal or availability, use **Replan with new settings**.
8. **Log out**, then **log in again** — everything is still there.

Extra pages that also use your real data: Progress (full deviation analysis), Topic Mastery, Readiness, Weekly Reviews (with an on-demand AI recommendation), What-If simulator, AI Coach.

## How "missed days" work

Only days whose date is *before today* can be missed, so a new plan starts with no deviation. Real missed days
therefore appear as time passes. To show the adaptive loop in a single sitting, skip/partially complete tasks
and press **Analyze my progress**, or press **Replan with AI**.

## API summary

`POST /api/auth/signup|login`, `GET|PATCH /api/auth/me`, `PUT /api/auth/password`, `POST /api/auth/logout`, `DELETE /api/auth/me`
`GET /api/plans/me/active`, `GET /api/plans/me/versions`, `GET /api/goals/user/me`, `POST /api/goals`, `PUT /api/goals/:id`
`POST /api/ai/generate-plan`, `POST /api/ai/adapt-plan`
`PATCH /api/progress/task`, `GET /api/progress/:planId`, `GET /api/progress/:planId/deviation`
All routes except health / signup / login require `Authorization: Bearer <token>`; every resource is scoped to its owner.
