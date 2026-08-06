import { account, trades } from './data/tradeData.js'
import { computeStats, computeRisk } from './utils/calculations.js'
import AccountSummary from './components/AccountSummary.jsx'
import PerformanceStats from './components/PerformanceStats.jsx'
import RiskIndicator from './components/RiskIndicator.jsx'
import TradeList from './components/TradeList.jsx'
import EquityCurve from './components/EquityCurve.jsx'

export default function App() {
  const stats = computeStats(trades)
  const risk = computeRisk(account, trades)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trader Risk Dashboard</h1>
        <p className="app-subtitle">
          A quick read on how you're performing against your account rules.
        </p>
      </header>

      <main className="dashboard-grid">
        <RiskIndicator risk={risk} account={account} />
        <AccountSummary account={account} currentBalance={risk.currentBalance} totalPnl={stats.totalPnl} />
        <PerformanceStats stats={stats} />
        <EquityCurve points={risk.equityCurve} startingBalance={account.startingBalance} />
        <TradeList trades={trades} />
      </main>
    </div>
  )
}
