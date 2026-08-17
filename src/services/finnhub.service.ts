import {
  getDateRange,
  validateArticle,
  formatArticle,
  formatPrice,
  formatChangePercent,
  formatMarketCapValue
} from '../lib/utils.js'

import { POPULAR_STOCK_SYMBOLS } from '../types/constants.js'

const FINNHUB_BASE_URL = process.env.FINNHUB_BASE_URL

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? ''

async function fetchJSON<T> (url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const text = await response.text().catch(() => '')

    throw new Error(`Fetch failed ${response.status}: ${text}`)
  }

  return await response.json()
}

export async function getNews (symbols?: string[]) {
  try {
    const token = FINNHUB_API_KEY

    if (!token) {
      throw new Error('FINNHUB_API_KEY missing')
    }

    const maxArticles = 6

    const cleanSymbols = (symbols || [])
      .map(s => s?.trim().toUpperCase())
      .filter(Boolean)

    const range = getDateRange(5)

    // company news
    if (cleanSymbols.length) {
      const allNews = await Promise.all(
        cleanSymbols.map(async symbol => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${range.from}&to=${range.to}&token=${token}`

            const data = await fetchJSON<any[]>(url)

            return data
              .filter(validateArticle)
              .map((article, index) =>
                formatArticle(article, true, symbol, index)
              )
          } catch (error) {
            console.error(error)

            return []
          }
        })
      )

      const articles = allNews
        .flat()
        .sort((a, b) => b.datetime - a.datetime)
        .slice(0, maxArticles)

      if (articles.length) {
        return articles
      }
    }

    // fallback
    const generalURL = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`

    const general = await fetchJSON<any[]>(generalURL)

    return general
      .filter(validateArticle)
      .slice(0, maxArticles)
      .map((article, index) => formatArticle(article, false, undefined, index))
  } catch (error) {
    console.error('getNews:', error)

    return []
  }
}

export async function searchStocks (
  query?: string,
  watchlistSymbols: string[] = []
) {
  try {
    if (!FINNHUB_API_KEY) {
      return []
    }

    const trimmed = typeof query === 'string' ? query.trim() : ''

    let results: any[] = []

    // Popular stocks mode
    if (!trimmed) {
      const profiles = await Promise.all(
        POPULAR_STOCK_SYMBOLS.map(async symbol => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`

            const profile = await fetchJSON<any>(url)

            return {
              symbol,
              profile
            }
          } catch (error) {
            console.error(`Failed for ${symbol}:`, error)

            return null
          }
        })
      )

      results = profiles.filter(Boolean).map(({ symbol, profile }: any) => ({
        symbol: symbol.toUpperCase(),

        name: profile?.name || symbol,

        exchange: profile?.exchange || 'US',

        type: 'Common Stock',

        isInWatchlist: watchlistSymbols.includes(symbol.toUpperCase())
      }))
    }

    // Search mode
    else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(
        trimmed
      )}&token=${FINNHUB_API_KEY}`

      const response = await fetchJSON<any>(url)

      results = (response.result || []).map((stock: any) => ({
        symbol: stock.symbol?.toUpperCase(),

        name: stock.description || stock.symbol,

        exchange: stock.displaySymbol || 'US',

        type: stock.type || 'Stock',

        isInWatchlist: watchlistSymbols.includes(stock.symbol.toUpperCase())
      }))
      // no slice here → unlimited search results
    }

    return results
  } catch (error) {
    console.error('searchStocks:', error)

    return []
  }
}

export async function getStocksDetails (symbol: string) {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY missing')
  }

  const cleanSymbol = symbol.trim().toUpperCase()

  const results = await Promise.allSettled([
    fetchJSON<any>(
      `${FINNHUB_BASE_URL}/quote?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`
    ),

    fetchJSON<any>(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`
    ),

    fetchJSON<any>(
      `${FINNHUB_BASE_URL}/stock/metric?symbol=${cleanSymbol}&metric=all&token=${FINNHUB_API_KEY}`
    )
  ])

  const [quoteResult, profileResult, financialsResult] = results

  const quote = quoteResult.status === 'fulfilled' ? quoteResult.value : null

  const profile =
    profileResult.status === 'fulfilled' ? profileResult.value : null

  const financials =
    financialsResult.status === 'fulfilled' ? financialsResult.value : null

  // Log individual failures without destroying the entire stock response
  if (quoteResult.status === 'rejected') {
    console.error(
      `Quote request failed for ${cleanSymbol}:`,
      quoteResult.reason
    )
  }

  if (profileResult.status === 'rejected') {
    console.error(
      `Profile request failed for ${cleanSymbol}:`,
      profileResult.reason
    )
  }

  if (financialsResult.status === 'rejected') {
    console.error(
      `Financial metrics request failed for ${cleanSymbol}:`,
      financialsResult.reason
    )
  }

  // Quote is the most important request. Without a valid price, we consider the stock request unsuccessful.
  if (quote?.c == null || quote.c === 0) {
    throw new Error(`No valid quote data received for ${cleanSymbol}`)
  }

  const changePercent = quote.dp ?? 0

  const peRatio = financials?.metric?.peNormalizedAnnual

  return {
    symbol: cleanSymbol,

    company: profile?.name ?? cleanSymbol,

    currentPrice: quote.c,

    changePercent,

    priceFormatted: formatPrice(quote.c),

    changeFormatted: formatChangePercent(changePercent),

    peRatio: peRatio != null ? peRatio.toFixed(1) : '—',

    marketCapFormatted:
      profile?.marketCapitalization != null
        ? formatMarketCapValue(profile.marketCapitalization)
        : '—'
  }
}
