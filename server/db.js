import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(path.join(__dirname, 'tradescape.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS account (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    startingBalance REAL NOT NULL,
    maxDrawdown REAL NOT NULL,
    dailyLossLimit REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL,
    pnl REAL NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

const accountCount = db.prepare('SELECT COUNT(*) AS n FROM account').get().n
if (accountCount === 0) {
  db.prepare(
    'INSERT INTO account (id, startingBalance, maxDrawdown, dailyLossLimit) VALUES (1, ?, ?, ?)'
  ).run(100000, 10000, 5000)
}

const tradeCount = db.prepare('SELECT COUNT(*) AS n FROM trades').get().n
if (tradeCount === 0) {
  const insert = db.prepare(
    'INSERT INTO trades (label, symbol, direction, pnl) VALUES (?, ?, ?, ?)'
  )
  const seedTrades = [
    ['BTC Long', 'BTC', 'Long', 1200],
    ['ETH Short', 'ETH', 'Short', -450],
    ['BTC Short', 'BTC', 'Short', 800],
    ['SOL Long', 'SOL', 'Long', -300],
    ['ETH Long', 'ETH', 'Long', 2000],
  ]
  for (const trade of seedTrades) insert.run(...trade)
}

export default db
