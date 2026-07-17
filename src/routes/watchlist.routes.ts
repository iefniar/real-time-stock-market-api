import { Router } from 'express'

import { requireAuth } from '../middleware/auth.middleware.ts'

import {
  addStock,
  removeStock,
  getWatchlist,
  getWatchlistData,
  toggleNewsViaEmailController
} from '../controllers/watchlist.controller.ts'

const router = Router()

// Protect every watchlist endpoint
router.use(requireAuth)

router.post('/', addStock)

router.delete('/:symbol', removeStock)

router.get('/', getWatchlist)

router.get('/data', getWatchlistData)

router.patch('/:symbol/news-email', toggleNewsViaEmailController)

export default router
