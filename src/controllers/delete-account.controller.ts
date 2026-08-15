import type { Request, Response } from 'express'
import crypto from 'node:crypto'

import { DeleteToken } from '../models/delete-token.model.js'
import { deleteUserAccount } from '../services/delete-account.service.js'

export async function deleteAccountByToken (req: Request, res: Response) {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Missing deletion token.'
      })
    }

    // Convert the received token into the lookup hash
    const tokenLookupHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find the stored token
    const deleteToken = await DeleteToken.findOne({
      tokenLookupHash,
      revoked: false
    })

    if (!deleteToken) {
      return res.status(400).json({
        error: 'Invalid or revoked deletion token.'
      })
    }

    const userId = deleteToken.userId

    // Delete all user data
    await deleteUserAccount(userId)

    // Prevent the same token being reused
    await DeleteToken.updateOne(
      {
        _id: deleteToken._id
      },
      {
        revoked: true
      }
    )

    return res.json({
      success: true,
      message: 'Account deleted successfully.'
    })
  } catch (error) {
    console.error('Delete account by token failed:', error)

    return res.status(500).json({
      error: 'Failed to delete account.'
    })
  }
}
