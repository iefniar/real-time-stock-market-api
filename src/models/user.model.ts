import mongoose, { Schema, model, type Document, type Model } from 'mongoose'

export interface UserDocument extends Document {
  email: string
  name: string
  country: string
}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
})

export const User: Model<UserDocument> =
  (mongoose.models?.User as Model<UserDocument>) ||
  model<UserDocument>(
    'User',
    UserSchema,
    'user' // Better Auth collection name
  )
