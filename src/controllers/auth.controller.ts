import type { Request, Response } from 'express'
import { auth } from '../lib/better-auth/auth.js'
import { inngest } from '../lib/inngest/client.js'
import {
  canProceed,
  incrementCounter
} from '../services/email-rate-limit.service.js'

// The following function is the old signUpWithEmail (currently we are not using
// this function to sign up users)
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

    const canCreateAccount = await canProceed('signup')

    if (!canCreateAccount) {
      return res.status(429).json({
        success: false,
        message: 'The daily account creation limit has been reached.'
      })
    }

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

    await incrementCounter('signup')
    await incrementCounter('total')

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

    // First check: Prevent Better Auth from creating another verification document when the daily limit has already been reached.
    const allowed = await canProceed('passwordReset')

    if (!allowed) {
      return res.status(429).json({
        success: false,
        error:
          'The daily password reset limit has been reached. Please try again tomorrow.'
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
