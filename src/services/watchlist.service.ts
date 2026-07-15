import { User } from '../models/user.model.ts'
import { Watchlist } from '../models/watchlist.model.ts'
import { getStocksDetails } from './finnhub.service.ts'

export async function getWatchlistSymbolsByEmail (
  email: string
): Promise<string[]> {
  if (!email) return []

  try {
    const user = await User.findOne({ email }, { _id: 1 }).lean()

    if (!user) return []

    const items = await Watchlist.find(
      { userId: user._id.toString() },
      { symbol: 1, _id: 0 }
    ).lean()

    return items.map(item => item.symbol)
  } catch (error) {
    console.error('getWatchlistSymbolsByEmail error:', error)

    return []
  }
}

export async function addToWatchlist (
  userId: string,
  symbol: string,
  company: string
) {
  const existing = await Watchlist.findOne({
    userId,
    symbol: symbol.toUpperCase()
  })

  if (existing) {
    return {
      success: false,
      error: 'Stock already in watchlist'
    }
  }

  const item = new Watchlist({
    userId,
    symbol: symbol.toUpperCase(),
    company: company.trim()
  })

  await item.save()

  return {
    success: true,
    message: 'Stock added to watchlist'
  }
}

export async function removeFromWatchlist (userId: string, symbol: string) {
  const result = await Watchlist.deleteOne({
    userId,
    symbol: symbol.toUpperCase()
  })

  if (result.deletedCount === 0) {
    return {
      success: false,
      message: 'Stock not found in watchlist'
    }
  }

  return {
    success: true,
    message: 'Stock removed from watchlist'
  }
}

export async function getUserWatchlist (userId: string) {
  return await Watchlist.find({
    userId
  })
    .sort({
      addedAt: -1
    })
    .lean()
}

export async function getWatchlistSymbols (userId: string) {
  const watchlist = await Watchlist.find(
    {
      userId
    },
    {
      symbol: 1,
      _id: 0
    }
  )

  return watchlist.map(item => item.symbol)
}

export async function getWatchlistWithData (userId: string) {
  const watchlist = await Watchlist.find({
    userId
  })
    .sort({
      addedAt: -1
    })
    .lean()

  if (!watchlist.length) {
    return []
  }

  const stocks = await Promise.all(
    watchlist.map(async item => {
      try {
        const stock = await getStocksDetails(item.symbol)

        return {
          company: stock.company,
          symbol: stock.symbol,
          currentPrice: stock.currentPrice,
          priceFormatted: stock.priceFormatted,
          changeFormatted: stock.changeFormatted,
          changePercent: stock.changePercent,
          marketCap: stock.marketCapFormatted,
          peRatio: stock.peRatio
        }
      } catch {
        return {
          company: item.company,
          symbol: item.symbol
        }
      }
    })
  )

  return stocks
}
