import StatCard from './StatCard.jsx'
import { formatCurrency } from '../utils/format.js'

export default function AccountSummary({ account, currentBalance, totalPnl }) {
  const pnlTone = totalPnl >= 0 ? 'positive' : 'negative'

  return (
    <section className="panel">
      <h2>Account</h2>
      <div className="stat-grid">
        <StatCard label="Starting Balance" value={formatCurrency(account.startingBalance)} />
        <StatCard label="Current Balance" value={formatCurrency(currentBalance)} tone={pnlTone} />
        <StatCard label="Total P&L" value={formatCurrency(totalPnl, true)} tone={pnlTone} />
        <StatCard label="Max Drawdown Allowed" value={formatCurrency(account.maxDrawdown)} />
        <StatCard label="Daily Loss Limit" value={formatCurrency(account.dailyLossLimit)} />
      </div>
    </section>
  )
}
