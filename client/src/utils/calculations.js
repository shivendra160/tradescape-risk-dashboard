// All numbers shown in the dashboard are derived from `account` + `trades`
// here — nothing is hardcoded in the UI layer.

/**
 * Builds a running equity curve starting from the account's starting balance,
 * applying each trade's P&L in sequence.
 */
export function computeEquityCurve(startingBalance, trades) {
  let balance = startingBalance
  const points = [{ label: 'Start', balance }]
  for (const trade of trades) {
    balance += trade.pnl
    points.push({ label: trade.label, balance, pnl: trade.pnl })
  }
  return points
}

/**
 * Win/loss trading performance stats. Handles the empty-trades edge case
 * (no divide-by-zero, no crashes on empty arrays).
 */
export function computeStats(trades) {
  if (!trades || trades.length === 0) {
    return {
      totalPnl: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      largestWin: null,
      largestLoss: null,
    }
  }

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
  const wins = trades.filter((t) => t.pnl > 0)
  const losses = trades.filter((t) => t.pnl < 0)

  const largestWin = wins.length
    ? wins.reduce((best, t) => (t.pnl > best.pnl ? t : best))
    : null
  const largestLoss = losses.length
    ? losses.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst))
    : null

  return {
    totalPnl,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: (wins.length / trades.length) * 100,
    largestWin,
    largestLoss,
  }
}

/**
 * Risk-rule math. Two account rules are evaluated against the trader's
 * running equity curve:
 *
 * - Max drawdown: measured as the drop from the account's peak (high-water
 *   mark) balance to the current balance. This is the standard way
 *   prop-style evaluation accounts track drawdown, because it resets
 *   upward every time the trader makes a new high, rather than staying
 *   pinned to the starting balance forever.
 *
 * - Daily loss limit: measured as the drop from the day's opening balance
 *   to the lowest equity point reached so far *today*. Since the supplied
 *   trades have no timestamps, they're all treated as "today" — see README.
 *
 * Status thresholds (% of a limit used, worst of the two rules):
 *   < 50%  -> Safe
 *   50-80% -> Approaching Limit
 *   >= 80%  -> At Risk
 */
export function computeRisk(account, trades) {
  const equityCurve = computeEquityCurve(account.startingBalance, trades)
  const balances = equityCurve.map((p) => p.balance)

  const currentBalance = balances[balances.length - 1]
  const peakBalance = Math.max(...balances)
  const dayOpenBalance = account.startingBalance
  const dayLowBalance = Math.min(...balances)

  const currentDrawdown = Math.max(0, peakBalance - currentBalance)
  const remainingDrawdown = Math.max(0, account.maxDrawdown - currentDrawdown)
  const drawdownPctUsed = account.maxDrawdown > 0
    ? (currentDrawdown / account.maxDrawdown) * 100
    : 0

  const currentDayLoss = Math.max(0, dayOpenBalance - dayLowBalance)
  const remainingDailyLoss = Math.max(0, account.dailyLossLimit - currentDayLoss)
  const dailyLossPctUsed = account.dailyLossLimit > 0
    ? (currentDayLoss / account.dailyLossLimit) * 100
    : 0

  const worstPctUsed = Math.max(drawdownPctUsed, dailyLossPctUsed)
  let status = 'Safe'
  if (worstPctUsed >= 80) status = 'At Risk'
  else if (worstPctUsed >= 50) status = 'Approaching Limit'

  return {
    currentBalance,
    peakBalance,
    currentDrawdown,
    remainingDrawdown,
    drawdownPctUsed,
    currentDayLoss,
    remainingDailyLoss,
    dailyLossPctUsed,
    worstPctUsed,
    status,
    equityCurve,
  }
}
