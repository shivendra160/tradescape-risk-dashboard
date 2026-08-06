# Tradescape — Trader Risk Dashboard

A single-page dashboard that shows a trader their account, trading performance, and — most importantly — how close they are to violating their evaluation account's risk rules.

## How to run

Requires Node 18+.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

To build for production / deploy:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

`npm run build` outputs a static `dist/` folder that can be deployed anywhere that serves static files (Vercel, Netlify, GitHub Pages, etc.) — no server or database required.

## What I built

- **Account panel** — starting balance, current balance, total P&L, max drawdown allowed, daily loss limit.
- **Trading performance panel** — winning trades, losing trades, win rate, largest winning trade, largest losing trade. All five numbers are *derived* from the trade list (`src/utils/calculations.js`), not hardcoded.
- **Risk indicator** — the core of the assignment. Shows current drawdown, remaining drawdown, current day's loss, and remaining daily loss limit, plus a single **Safe / Approaching Limit / At Risk** badge so the trader gets an answer in one glance, without doing math themselves.
- **Trade list** — the raw trades, for reference.
- Stack: React + Vite, plain CSS (no UI framework), no charting library. Everything is a small, reusable component (`StatCard`, `RiskIndicator`, etc.) rather than one big page.

### How the risk math works

- **Drawdown** is measured from the account's *peak* balance (high-water mark), not just the starting balance — because that's how most funded/evaluation accounts actually define it. `currentDrawdown = peak balance − current balance`.
- **Daily loss** is measured from the day's opening balance to the lowest equity point reached *that day*. Since the supplied trades have no timestamps, the dashboard treats all five trades as happening on the same (current) trading day — a documented assumption in `src/data/tradeData.js`.
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
- Make account rules configurable (different firms define drawdown as trailing vs. static, or lock it at a fixed floor once a profit target is hit) rather than assuming one convention.
- Add trade filtering/sorting (by asset, by win/loss, by date) and a performance-by-asset breakdown.
- Add push-style alerts when the trader crosses the "Approaching Limit" threshold, not just a passive badge.
- Write unit tests for `calculations.js`, since that's the part correctness matters most for.
- Spend real time on visual/interaction polish and accessibility (currently intentionally minimal, per the assignment's guidance not to over-invest in visual design).
