import type { Request } from 'express'
import { auth } from './better-auth/auth.ts'

export async function getUser (req: Request) {
  const headers = new Headers()

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v))
    } else if (value !== undefined) {
      headers.set(key, value)
    }
  }

  const session = await auth.api.getSession({
    headers
  })

  return session?.user
}
