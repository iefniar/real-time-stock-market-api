import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { mongoClient } from '../db/dbConnection.ts'
import { Watchlist } from '../../models/watchlist.model.ts'
import type { VerificationEmailUser } from '../../types/types.ts'
import { inngest } from '../inngest/client.ts'
import { sendResetPasswordEmail } from '../nodemailer/index.ts'
import {
  canProceed,
  incrementCounter
} from '../../services/email-rate-limit.service.ts'

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.FRONTEND_URL!],
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true, // Don't allow login until verified
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: false, // Don't automatically sign the user in after signup
    revokeSessionsOnPasswordReset: true, // Invalidate every session after a successful password reset
    resetPasswordTokenExpiresIn: 60 * 60, // Password reset link expires after 1 hour

    async sendResetPassword ({ user, url }) {
      const allowed = await canProceed('passwordReset')

      if (!allowed) {
        console.warn(`Password reset email limit reached for ${user.email}.`)

        return
      }

      await sendResetPasswordEmail({
        email: user.email,
        name: user.name,
        resetPasswordUrl: url
      })

      await incrementCounter('passwordReset')
      await incrementCounter('total')
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60 * 24, // 24 hours

    async sendVerificationEmail ({ user, url }) {
      const verificationUser = user as VerificationEmailUser

      await inngest.send({
        name: 'app/user.verification-email',
        data: {
          userId: verificationUser.id,
          email: verificationUser.email,
          name: verificationUser.name,
          country: verificationUser.country,
          investmentGoals: verificationUser.investmentGoals,
          riskTolerance: verificationUser.riskTolerance,
          preferredIndustry: verificationUser.preferredIndustry,
          verificationUrl: url
        }
      })
    }
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async user => {
        await Watchlist.deleteMany({
          userId: user.id
        })
      }
    },
    additionalFields: {
      country: {
        type: 'string',
        required: true,
        returned: true
      },

      investmentGoals: {
        type: 'string',
        required: true,
        returned: true
      },

      riskTolerance: {
        type: 'string',
        required: true,
        returned: true
      },

      preferredIndustry: {
        type: 'string',
        required: true,
        returned: true
      }
    }
  }
})
