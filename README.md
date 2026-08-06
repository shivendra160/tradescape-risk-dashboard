# Tradescape — Trader Risk Dashboard

A full-stack dashboard that shows a trader their account, trading performance, and — most importantly — how close they are to violating their evaluation account's risk rules.

The assignment brief explicitly says a database isn't required ("You do not need to build authentication, a database, or a real trading API"). I built one anyway as a full-stack extension: a React client backed by a small Express + SQLite API, so account and trade data is served from — and persisted in — a real database instead of a static JS file.

## Architecture

```
tradescape-risk-dashboard/
├── client/          React + Vite frontend (port 5173)
└── server/          Express API + SQLite database (port 4000)
```

- **`server/`** — Express REST API. `server/db.js` opens a SQLite database (`server/tradescape.db`, using Node's built-in `node:sqlite`, no native module compilation required) and seeds it with the assignment's account and trade data on first run. `server/index.js` exposes:
  - `GET /api/account` — account rules (starting balance, max drawdown, daily loss limit)
  - `GET /api/trades` — the trade list
  - `POST /api/trades` — add a new trade (persists to the DB; validates `label`/`symbol`/`direction`/`pnl`)
- **`client/`** — the same React dashboard as before, now fetching account + trades from the API (`client/src/api.js`) instead of importing a static data file. All derived numbers (P&L, win rate, drawdown, etc.) are still computed client-side in `client/src/utils/calculations.js` — the database changed *where the raw data comes from*, not how the numbers are derived.

## How to run

Requires Node 20+ (uses Node's built-in `node:sqlite`, which is available from Node 22.5+ / stable enough on Node 24 — tested on Node 24).

From the project root:

```bash
npm install
npm run install:all   # installs server + client dependencies
npm run dev            # runs the API (port 4000) and the client (port 5173) together
```

Then open `http://localhost:5173`. The client's dev server proxies `/api/*` requests to the backend, so no extra config is needed.

To run the two halves separately (e.g. in two terminals):

```bash
npm run dev --prefix server   # http://localhost:4000
npm run dev --prefix client   # http://localhost:5173
```

The SQLite file (`server/tradescape.db`) is created automatically on first run and is git-ignored — delete it to reset to the original seed data.

## Live deployment

- **Client (GitHub Pages):** https://shivendra160.github.io/tradescape-risk-dashboard/
- **API (Render):** https://tradescape-risk-dashboard-api.onrender.com

Deploy setup:
- `render.yaml` is a Render Blueprint for the `server/` API (free web service). Render's free tier spins the service down when idle, so the SQLite file resets to seed data on cold start — expected for a demo, not a bug.
- `.github/workflows/deploy-pages.yml` builds `client/` with `VITE_API_URL` pointed at the Render API and publishes it to GitHub Pages on every push to `main`.

### Building for production

```bash
npm run build   # builds the client into client/dist
```

The built client is static and can be deployed anywhere that serves static files, as long as it's pointed (via `VITE_API_URL`) at a hosted instance of `server/`. The server itself is a plain Node process (`npm start --prefix server`) and can run on any Node host; because it uses a local SQLite file, deploy it somewhere with a persistent disk (e.g. Render/Fly.io with a volume) rather than a purely serverless/ephemeral platform, or the trade data added via `POST /api/trades` won't survive a redeploy.

## What I built

- **Account panel** — starting balance, current balance, total P&L, max drawdown allowed, daily loss limit.
- **Trading performance panel** — winning trades, losing trades, win rate, largest winning trade, largest losing trade. All five numbers are *derived* from the trade list (`client/src/utils/calculations.js`), not hardcoded.
- **Risk indicator** — the core of the assignment. Shows current drawdown, remaining drawdown, current day's loss, and remaining daily loss limit, plus a single **Safe / Approaching Limit / At Risk** badge so the trader gets an answer in one glance, without doing math themselves.
- **Trade list** — the raw trades, for reference.
- **A real backend** — Express + SQLite API serving and persisting the account and trade data (see Architecture above).
- Stack: React + Vite on the client, Express + SQLite on the server, plain CSS (no UI framework), no charting library. Everything is a small, reusable component (`StatCard`, `RiskIndicator`, etc.) rather than one big page.

### How the risk math works

- **Drawdown** is measured from the account's *peak* balance (high-water mark), not just the starting balance — because that's how most funded/evaluation accounts actually define it. `currentDrawdown = peak balance − current balance`.
- **Daily loss** is measured from the day's opening balance to the lowest equity point reached *that day*. Since the supplied trades have no timestamps, the dashboard treats all five trades as happening on the same (current) trading day — a documented assumption in `server/db.js`, where the seed data lives now.
- **Status thresholds** use the worse of the two rules (drawdown % used vs. daily loss % used): under 50% used → **Safe**, 50–80% → **Approaching Limit**, 80%+ (including a breach) → **At Risk**.
- With the given data, the account never dips below its starting balance and ends at a new equity high, so it correctly shows **Safe** with $0 drawdown and $0 daily loss used — a real, non-hardcoded result of the math, not a canned "everything's fine" message. (I verified the logic separately against a losing scenario to confirm it correctly escalates to "At Risk.")

## Additional feature: Equity Curve

I added an **equity curve** — a chart of account balance after each trade, from the starting balance onward.

Why: the stat cards answer "what happened" (win rate, P&L, etc.), but they don't show *how* the trader got there. A trader who's up $3,250 after five choppy trades that dipped and recovered is in a very different position, risk-wise, than one who went up in a straight line — even though every other number on the dashboard looks identical. The equity curve makes that visible instantly, and it's also what the drawdown calculation is built on, so it makes the risk numbers easier to trust rather than just take on faith. I built it as a small inline SVG component rather than pulling in a charting library, to keep the app dependency-free.

## Product questions

**1. What is drawdown in trading?**

Drawdown is the decline in an account's value from a peak (its highest balance so far) to a subsequent low point, usually expressed in dollars or as a percentage. It's different from a simple loss: if you make $5,000, lose $2,000, then make $1,000, your total P&L is still positive, but you experienced a $2,000 drawdown from your peak. Drawdown resets every time the account reaches a new high.

**2. Why would a trader care about remaining drawdown rather than just their current P&L?**

P&L tells you how you're doing overall; remaining drawdown tells you how much room you have left before you're disqualified or your account is shut down — which is the number that actually governs what you're allowed to do next. A trader can be net profitable and still be one bad trade away from breaching a rule if they've given back a lot from their peak. Remaining drawdown is the actionable, forward-looking number ("how much more can I lose before I'm out"), while P&L is backward-looking. Risk decisions — position size, whether to keep trading today, when to stop — should be driven by the former.

**3. If I had another day, what would I improve?**

- Use real timestamps per trade so daily loss and drawdown are computed against actual trading days instead of the "all trades are today" assumption.
- Track a multi-day equity history and a calendar/heatmap of daily P&L (best/worst day), not just a single day's trades.
- Make account rules configurable (different firms define drawdown as trailing vs. static, or lock it at a fixed floor once a profit target is hit) rather than assuming one convention, and expose that via `PUT /api/account`.
- Add trade filtering/sorting (by asset, by win/loss, by date) and a performance-by-asset breakdown.
- Add push-style alerts when the trader crosses the "Approaching Limit" threshold, not just a passive badge.
- Write unit/integration tests, both for `calculations.js` on the client and for the API routes on the server, since correctness matters most there.
- Add a UI for adding/editing trades (the `POST /api/trades` endpoint exists, but there's no form for it yet) and swap `node:sqlite` for a more battle-tested driver before treating this as production-ready, since it's still an experimental Node API.
- Spend real time on visual/interaction polish and accessibility (currently intentionally minimal, per the assignment's guidance not to over-invest in visual design).
