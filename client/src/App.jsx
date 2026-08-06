import { useEffect, useState } from 'react'
import { getAccount, getTrades } from './api.js'
import { computeStats, computeRisk } from './utils/calculations.js'
import AccountSummary from './components/AccountSummary.jsx'
import PerformanceStats from './components/PerformanceStats.jsx'
import RiskIndicator from './components/RiskIndicator.jsx'
import TradeList from './components/TradeList.jsx'
import EquityCurve from './components/EquityCurve.jsx'

export default function App() {
  const [account, setAccount] = useState(null)
  const [trades, setTrades] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getAccount(), getTrades()])
      .then(([account, trades]) => {
        setAccount(account)
        setTrades(trades)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="app">
        <div className="error-banner">
          Couldn't reach the Tradescape API — is the backend running on port 4000?
          <br />
          {error}
        </div>
      </div>
    )
  }

  if (!account || !trades) {
    return (
      <div className="app">
        <p className="loading-state">Loading dashboard…</p>
      </div>
    )
  }

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
