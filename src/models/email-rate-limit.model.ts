import mongoose, { Schema, model, type Document, type Model } from 'mongoose'
import type { EmailCategory } from '../types/types.ts'

export interface EmailRateLimitDocument extends Document {
  category: EmailCategory
  count: number
  lastResetDate: string
}

const EmailRateLimitSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true
    },

    count: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

export const EmailRateLimit: Model<EmailRateLimitDocument> =
  (mongoose.models?.EmailRateLimit as Model<EmailRateLimitDocument>) ||
  model<EmailRateLimitDocument>(
    'EmailRateLimit',
    EmailRateLimitSchema,
    'emailRateLimit' // mongodb collection name
  )
