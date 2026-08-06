import express from 'express'
import cors from 'cors'
import db from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

// Account rules are singular (one evaluation account per trader in this scope).
app.get('/api/account', (req, res) => {
  const account = db.prepare('SELECT * FROM account WHERE id = 1').get()
  res.json(account)
})

app.get('/api/trades', (req, res) => {
  const trades = db
    .prepare('SELECT id, label, symbol, direction, pnl, createdAt FROM trades ORDER BY id ASC')
    .all()
  res.json(trades)
})

// Lets the trade list actually persist in the database rather than just
// being read-only seed data indistinguishable from a static JSON file.
app.post('/api/trades', (req, res) => {
  const { label, symbol, direction, pnl } = req.body ?? {}

  if (typeof label !== 'string' || !label.trim()) {
    return res.status(400).json({ error: 'label is required' })
  }
  if (typeof symbol !== 'string' || !symbol.trim()) {
    return res.status(400).json({ error: 'symbol is required' })
  }
  if (direction !== 'Long' && direction !== 'Short') {
    return res.status(400).json({ error: 'direction must be "Long" or "Short"' })
  }
  if (typeof pnl !== 'number' || !Number.isFinite(pnl)) {
    return res.status(400).json({ error: 'pnl must be a finite number' })
  }

  const result = db
    .prepare('INSERT INTO trades (label, symbol, direction, pnl) VALUES (?, ?, ?, ?)')
    .run(label.trim(), symbol.trim().toUpperCase(), direction, pnl)

  const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(trade)
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Tradescape API listening on http://localhost:${PORT}`)
})
