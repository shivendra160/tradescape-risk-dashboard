// Small reusable card used across every panel in the dashboard so stat
// styling only lives in one place.
export default function StatCard({ label, value, sublabel, tone = 'neutral' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sublabel && <div className="stat-sublabel">{sublabel}</div>}
    </div>
  )
}
