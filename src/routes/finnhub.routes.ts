import { Router } from 'express'

import {
  getMarketNews,
  searchStock,
  getStockDetails
} from '../controllers/finnhub.controller.ts'

import { optionalAuth } from '../middleware/optionalAuth.middleware.ts'

const router = Router()

router.get('/news', getMarketNews)

router.get('/stocks/search', optionalAuth, searchStock)

router.get('/stocks/:symbol', getStockDetails)

export default router
