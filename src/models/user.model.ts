import mongoose, { Schema, model, type Document, type Model } from 'mongoose'

export interface UserDocument extends Document {
  email: string
  name: string
  emailVerified: boolean
  country: string
  investmentGoals: string
  riskTolerance: string
  preferredIndustry: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema(
  {
    email: String,
    name: String,
    emailVerified: Boolean,
    country: String,
    investmentGoals: String,
    riskTolerance: String,
    preferredIndustry: String
  },
  {
    timestamps: true, //matches Better Auth's createdAt and updatedAt
    strict: false //lets Better Auth continue storing any fields it wants
  }
)

export const User: Model<UserDocument> =
  (mongoose.models?.User as Model<UserDocument>) ||
  model<UserDocument>(
    'User',
    UserSchema,
    'user' // Better Auth collection name
  )
