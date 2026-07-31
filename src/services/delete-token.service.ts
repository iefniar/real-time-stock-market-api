import { DeleteToken } from '../models/delete-token.model.ts'
import {
  generateToken,
  encryptToken,
  decryptToken
} from '../lib/security/delete-token.ts'
import crypto from 'crypto'

// Returns the user's existing token. If none exists, a new one is created.

export async function getOrCreateDeleteToken (userId: string): Promise<string> {
  const existingToken = await DeleteToken.findOne({
    userId,
    revoked: false
  })

  if (existingToken) {
    return decryptToken(existingToken.encryptedToken, existingToken.iv)
  }

  // 1. Generate the real token
  const token = generateToken()

  // 2. Create a lookup hash
  const tokenLookupHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  // 3. Encrypt the real token  
  const { encryptedToken, iv } = encryptToken(token)

  // 4. Store encrypted token + lookup hash
  await DeleteToken.create({
    userId,
    encryptedToken,
    tokenLookupHash,
    iv,
    revoked: false
  })

  // 5. Return the real token so it can be placed in the email URL
  return token
}

// Retrieves the stored token.

export async function getDeleteToken (userId: string): Promise<string | null> {
  const document = await DeleteToken.findOne({
    userId,
    revoked: false
  })

  if (!document) {
    return null
  }

  return decryptToken(document.encryptedToken, document.iv)
}

// Revokes a token.

export async function revokeDeleteToken (userId: string) {
  await DeleteToken.updateOne(
    { userId },
    {
      revoked: true
    }
  )
}
