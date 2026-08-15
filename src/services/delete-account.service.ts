import mongoose, { Types } from 'mongoose'
import { User } from '../models/user.model.js'
import { Watchlist } from '../models/watchlist.model.js'
import { DeleteToken } from '../models/delete-token.model.js'

export async function deleteUserAccount (userId: string) {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const db = mongoose.connection.db

    if (!db) {
      throw new Error('MongoDB connection is not initialized.')
    }

    // Delete user's watchlist
    await Watchlist.deleteMany(
      {
        userId
      },
      {
        session
      }
    )

    // Delete Better Auth sessions
    await db.collection('session').deleteMany(
      {
        userId: new Types.ObjectId(userId)
      },
      {
        session
      }
    )

    // Delete Better Auth accounts
    await db.collection('account').deleteMany(
      {
        userId: new Types.ObjectId(userId)
      },
      {
        session
      }
    )

    // Delete Better Auth verification records
    await db.collection('verification').deleteMany(
      {
        value: userId
      },
      {
        session
      }
    )

    // Delete permanent delete token
    await DeleteToken.deleteMany(
      {
        userId
      },
      {
        session
      }
    )

    // Delete Better Auth user
    await User.deleteOne(
      {
        _id: userId
      },
      {
        session
      }
    )

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()

    throw error
  } finally {
    await session.endSession()
  }
}
