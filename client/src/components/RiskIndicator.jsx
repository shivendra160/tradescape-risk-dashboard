import StatCard from './StatCard.jsx'
import { formatCurrency, formatPercent } from '../utils/format.js'

const STATUS_CONFIG = {
  Safe: {
    className: 'status-safe',
    message: "You're well within your account rules.",
  },
  'Approaching Limit': {
    className: 'status-warning',
    message: "You're getting close to a limit — trade carefully.",
  },
  'At Risk': {
    className: 'status-danger',
    message: "You're close to or have breached a rule. Stop and reassess before your next trade.",
  },
}

export default function RiskIndicator({ risk, account }) {
  const cfg = STATUS_CONFIG[risk.status]

  return (
    <section className={`panel risk-panel ${cfg.className}`}>
      <div className="risk-header">
        <h2>Risk Status</h2>
        <span className="status-badge">{risk.status}</span>
      </div>
      <p className="risk-message">{cfg.message}</p>

      <div className="stat-grid">
        <StatCard
          label="Current Drawdown"
          value={formatCurrency(risk.currentDrawdown)}
          sublabel={`${formatPercent(risk.drawdownPctUsed)} of limit used`}
        />
        <StatCard
          label="Remaining Drawdown"
          value={formatCurrency(risk.remainingDrawdown)}
          sublabel={`of ${formatCurrency(account.maxDrawdown)} allowed`}
        />
        <StatCard
          label="Current Day's Loss"
          value={formatCurrency(risk.currentDayLoss)}
          sublabel={`${formatPercent(risk.dailyLossPctUsed)} of limit used`}
        />
        <StatCard
          label="Remaining Daily Loss Limit"
          value={formatCurrency(risk.remainingDailyLoss)}
          sublabel={`of ${formatCurrency(account.dailyLossLimit)} allowed`}
        />
      </div>

      <div className="risk-bars">
        <RiskBar label="Drawdown used" pct={risk.drawdownPctUsed} />
        <RiskBar label="Daily loss used" pct={risk.dailyLossPctUsed} />
      </div>
    </section>
  )
}

function RiskBar({ label, pct }) {
  const clamped = Math.min(100, Math.max(0, pct))
  const tone = clamped >= 80 ? 'bar-danger' : clamped >= 50 ? 'bar-warning' : 'bar-safe'

  return (
    <div className="risk-bar-row">
      <div className="risk-bar-label">{label}</div>
      <div className="risk-bar-track">
        <div className={`risk-bar-fill ${tone}`} style={{ width: `${clamped}%` }} />
      </div>
      <div className="risk-bar-pct">{formatPercent(pct)}</div>
    </div>
  )
}
