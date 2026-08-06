import StatCard from './StatCard.jsx'
import { formatCurrency, formatPercent } from '../utils/format.js'

export default function PerformanceStats({ stats }) {
  const { winCount, lossCount, winRate, largestWin, largestLoss } = stats

  return (
    <section className="panel">
      <h2>Trading Performance</h2>
      <div className="stat-grid">
        <StatCard label="Winning Trades" value={winCount} tone="positive" />
        <StatCard label="Losing Trades" value={lossCount} tone="negative" />
        <StatCard label="Win Rate" value={formatPercent(winRate)} />
        <StatCard
          label="Largest Win"
          value={largestWin ? formatCurrency(largestWin.pnl, true) : '—'}
          sublabel={largestWin?.label}
          tone="positive"
        />
        <StatCard
          label="Largest Loss"
          value={largestLoss ? formatCurrency(largestLoss.pnl) : '—'}
          sublabel={largestLoss?.label}
          tone="negative"
        />
      </div>
    </section>
  )
}
