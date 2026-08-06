import { formatCurrency } from '../utils/format.js'

export default function TradeList({ trades }) {
  return (
    <section className="panel">
      <h2>Trades</h2>
      {trades.length === 0 ? (
        <p className="empty-state">No trades yet today.</p>
      ) : (
        <table className="trade-table">
          <thead>
            <tr>
              <th>Trade</th>
              <th>P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id}>
                <td>{t.label}</td>
                <td className={t.pnl >= 0 ? 'text-positive' : 'text-negative'}>
                  {formatCurrency(t.pnl, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
