import { Router } from 'express'

import {
  getMarketNews,
  searchStock,
  getStockDetails
} from '../controllers/finnhub.controller.js'

import { optionalAuth } from '../middleware/optionalAuth.middleware.js'

const router = Router()

router.get('/news', getMarketNews)

router.get('/stocks/search', optionalAuth, searchStock)

router.get('/stocks/:symbol', getStockDetails)

export default router
