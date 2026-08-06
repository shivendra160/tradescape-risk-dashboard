// Additional feature: equity curve. Plain SVG (no chart library) so the
// dashboard has zero extra runtime dependencies.
export default function EquityCurve({ points, startingBalance }) {
  const width = 640
  const height = 220
  const padding = 36

  if (!points || points.length < 2) {
    return (
      <section className="panel">
        <h2>Equity Curve</h2>
        <p className="empty-state">Not enough data to draw a curve yet.</p>
      </section>
    )
  }

  const values = points.map((p) => p.balance)
  const min = Math.min(...values, startingBalance)
  const max = Math.max(...values, startingBalance)
  const range = max - min || 1

  const xStep = (width - padding * 2) / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = padding + i * xStep
    const y = height - padding - ((p.balance - min) / range) * (height - padding * 2)
    return { ...p, x, y }
  })

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const baselineY = height - padding - ((startingBalance - min) / range) * (height - padding * 2)

  return (
    <section className="panel">
      <h2>Equity Curve</h2>
      <svg viewBox={`0 0 ${width} ${height}`} className="equity-chart" preserveAspectRatio="xMidYMid meet">
        <line x1={padding} y1={baselineY} x2={width - padding} y2={baselineY} className="baseline" />
        <path d={pathD} className="equity-line" fill="none" />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="4"
            className={c.balance >= startingBalance ? 'point-positive' : 'point-negative'}
          >
            <title>{`${c.label}: $${c.balance.toLocaleString()}`}</title>
          </circle>
        ))}
      </svg>
      <div className="equity-labels">
        {points.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </section>
  )
}
