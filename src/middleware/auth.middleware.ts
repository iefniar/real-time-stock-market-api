import type { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/better-auth/auth.ts'

export async function requireAuth (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Convert Express headers -> Fetch Headers
    const headers = new Headers()

    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.set(key, value)
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(','))
      }
    })

    const session = await auth.api.getSession({
      headers
    })

    if (!session?.user) {
      return res.status(401).json({
        error: 'Unauthorized'
      })
    }

    req.user = session.user

    next()
  } catch (error) {
    console.error(error)

    return res.status(401).json({
      error: 'Unauthorized'
    })
  }
}
