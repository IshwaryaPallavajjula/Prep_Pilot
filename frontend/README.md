# PrepPilot — frontend

React 18 + Vite + React Router + Tailwind + Recharts + Lucide.

The app talks to the Express API in `../backend` — there is no mock data in the running app.
Login state is a JWT stored in `localStorage` (`preppilot.session.v2`); every request also sends
the user's local calendar day in an `X-Client-Date` header.

```
src/
├── context/     ToastContext, AppContext (auth session), PlanContext (plan, progress, deviation, adaptation)
├── services/    api.js (fetch client), authService, planService, progressService, coachService, simulationService
├── utils/       dates.js (timezone-safe calendar days), planSelectors.js (readiness / mastery / reviews from real data)
├── pages/       one folder per route
└── components/  UI grouped by feature
```

```bash
cp .env.example .env     # only if the API is not on http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
npm run build
```
