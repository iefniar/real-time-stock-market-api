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
        name: fullName,
        country,
        investmentGoals,
        riskTolerance,
        preferredIndustry
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

export async function sendWelcomeVerificationEmail (
  req: Request,
  res: Response
) {
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
        name: fullName,
        country,
        investmentGoals,
        riskTolerance,
        preferredIndustry,
        callbackURL: `${process.env.FRONTEND_URL}/email-verified`
      },
      asResponse: true
    })

    // Forward Better Auth's headers (cookies, etc.)
    authResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    return res.status(201).json({
      success: true,
      message:
        'Account created successfully. Please check your email to verify your account.'
    })
  } catch (error) {
    console.error('Sign up failed:', error)

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function forgotPassword (req: Request, res: Response) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required.'
      })
    }

    // Convert Express headers to Fetch Headers
    const headers = new Headers()

    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v))
      } else if (value !== undefined) {
        headers.set(key, value)
      }
    }

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      },
      headers
    })

    // Don't reveal whether the email exists (for security reasons).
    return res.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: 'Failed to send password reset email.'
    })
  }
}
