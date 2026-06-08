import type { Request, Response } from 'express'
import { auth } from '../lib/better-auth/auth.ts'
import { inngest } from '../lib/inngest/client.ts'

export async function signUpWithEmail (req: Request, res: Response) {
  try {
    const {
      email,
      password,
      fullName,
      country,
      investmentGoals,
      riskTolerance,
      preferredIndustry
    } = req.body

    const authResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName
      },
      asResponse: true
    })

    authResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    await inngest.send({
      name: 'app/user.created',
      data: {
        email,
        name: fullName,
        country,
        investmentGoals,
        riskTolerance,
        preferredIndustry
      }
    })

    return res.status(201).json({
      success: true
    })
  } catch (error) {
    console.error('Sign up failed:', error)

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
