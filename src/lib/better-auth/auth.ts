import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { mongoClient } from '../db/dbConnection.ts'

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.FRONTEND_URL!],
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: true
  },
  user: {
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
