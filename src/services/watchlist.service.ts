import { User } from '../models/user.model.js'
import { Watchlist } from '../models/watchlist.model.js'
import { getStocksDetails } from './finnhub.service.js'

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
  const normalizedSymbol = symbol.toUpperCase()

  // Check if the stock is already in the user's watchlist
  const existing = await Watchlist.findOne({
    userId,
    symbol: normalizedSymbol
  })

  if (existing) {
    return {
      success: false,
      error: 'Stock already in watchlist'
    }
  }

  // Maximum of 5 stocks per user
  const watchlistCount = await Watchlist.countDocuments({
    userId
  })

  if (watchlistCount >= 5) {
    return {
      success: false,
      error: 'You can only have up to 5 stocks in your watchlist'
    }
  }

  // Add the stock
  const item = new Watchlist({
    userId,
    symbol: normalizedSymbol,
    company: company.trim(),
    isNewsViaEmailActive: false
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
          peRatio: stock.peRatio,
          isNewsViaEmailActive: item.isNewsViaEmailActive
        }
      } catch {
        return {
          company: item.company,
          symbol: item.symbol,
          isNewsViaEmailActive: item.isNewsViaEmailActive
        }
      }
    })
  )

  return stocks
}

export async function toggleNewsViaEmail (userId: string, symbol: string) {
  const item = await Watchlist.findOne({
    userId,
    symbol: symbol.toUpperCase()
  })

  if (!item) {
    throw new Error('Stock not found')
  }

  item.isNewsViaEmailActive = !item.isNewsViaEmailActive

  await item.save()

  return {
    success: true,
    isNewsViaEmailActive: item.isNewsViaEmailActive
  }
}
