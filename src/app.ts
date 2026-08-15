/* import 'dotenv/config' */ // Only for local development, on production all variables are configured inside Vercel
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { connectToDatabase } from './lib/db/dbConnection.ts'
import { auth } from './lib/better-auth/auth.ts'
import { inngestHandler } from './routes/inngest/route.ts'
import authRoutes from './routes/auth.routes.ts'
import finnhubRoutes from './routes/finnhub.routes.ts'
import watchlistRoutes from './routes/watchlist.routes.ts'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json())

// Make sure MongoDB is connected before handling requests
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

app.all('/api/auth/*splat', toNodeHandler(auth))

app.use('/api/inngest', inngestHandler)

app.use('/api/users', authRoutes)

app.use('/api/finnhub', finnhubRoutes)

app.use('/api/watchlist', watchlistRoutes)

export default app
