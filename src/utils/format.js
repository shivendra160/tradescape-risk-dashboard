// Small formatting helpers kept separate from calculation logic so
// components never need to know about currency/percent formatting rules.

export function formatCurrency(value, showSign = false) {
  const sign = showSign && value > 0 ? '+' : ''
  const negative = value < 0 ? '-' : ''
  const magnitude = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${negative}${sign}$${magnitude}`
}

export function formatPercent(value, digits = 0) {
  if (!Number.isFinite(value)) return '0%'
  return `${value.toFixed(digits)}%`
}
