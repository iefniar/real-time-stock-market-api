import mongoose, { Schema, model, type Document, type Model } from 'mongoose'

export interface DeleteTokenDocument extends Document {
  userId: string
  encryptedToken: string
  tokenLookupHash: string
  iv: string
  revoked: boolean
  createdAt: Date
  updatedAt: Date
}

const DeleteTokenSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    encryptedToken: {
      type: String,
      required: true,
      unique: true
    },

    tokenLookupHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    iv: {
      type: String,
      required: true
    },

    revoked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

export const DeleteToken: Model<DeleteTokenDocument> =
  (mongoose.models?.DeleteToken as Model<DeleteTokenDocument>) ||
  model<DeleteTokenDocument>('DeleteToken', DeleteTokenSchema, 'deleteToken')
