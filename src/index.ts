import 'dotenv/config' // To load the .env variables
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

async function startServer () {
  await connectToDatabase()

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )

  app.use(express.json())

  app.all('/api/auth/*splat', toNodeHandler(auth))

  app.use('/api/inngest', inngestHandler)

  app.use('/api/users', authRoutes)

  app.use('/api/finnhub', finnhubRoutes)

  app.use('/api/watchlist', watchlistRoutes)

  app.listen(process.env.HTTP_PORT, () => {
    console.log('Server running on port ' + process.env.HTTP_PORT)
  })
}

startServer()
