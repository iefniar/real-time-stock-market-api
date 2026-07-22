import type { Request, Response } from 'express'
import { getUser } from '../lib/auth-utils.ts'
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlistWithData,
  getWatchlistSymbols,
  toggleNewsViaEmail
} from '../services/watchlist.service.ts'

type SymbolStockParams = {
  symbol: string
}

export async function addStock (req: Request, res: Response) {
  const user = await getUser(req)

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized'
    })
  }

  const { symbol, company } = req.body

  const result = await addToWatchlist(user.id, symbol, company)

  res.json(result)
}

export async function removeStock (
  req: Request<SymbolStockParams>,
  res: Response
) {
  const user = await getUser(req)

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized'
    })
  }

  const result = await removeFromWatchlist(user.id, req.params.symbol)

  res.json(result)
}

export async function getWatchlist (req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized'
    })
  }

  const symbols = await getWatchlistSymbols(req.user.id)

  res.json(symbols)
}

export async function getWatchlistData (req: Request, res: Response) {
  const user = await getUser(req)

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized'
    })
  }

  const watchlist = await getWatchlistWithData(user.id)

  res.json(watchlist)
}

export async function toggleNewsViaEmailController (
  req: Request<SymbolStockParams>,
  res: Response
) {
  const user = await getUser(req)

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized'
    })
  }

  const result = await toggleNewsViaEmail(user.id, req.params.symbol)

  res.json(result)
}
