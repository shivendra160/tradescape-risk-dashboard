// Mock account + trade data.
// In a real app this would come from the trader's account/trade history API.

export const account = {
  startingBalance: 100000,
  maxDrawdown: 10000,
  dailyLossLimit: 5000,
}

// No timestamps were provided in the assignment, so these trades are treated
// as all having happened during the current trading day (see README).
export const trades = [
  { id: 1, label: 'BTC Long', symbol: 'BTC', direction: 'Long', pnl: 1200 },
  { id: 2, label: 'ETH Short', symbol: 'ETH', direction: 'Short', pnl: -450 },
  { id: 3, label: 'BTC Short', symbol: 'BTC', direction: 'Short', pnl: 800 },
  { id: 4, label: 'SOL Long', symbol: 'SOL', direction: 'Long', pnl: -300 },
  { id: 5, label: 'ETH Long', symbol: 'ETH', direction: 'Long', pnl: 2000 },
]
