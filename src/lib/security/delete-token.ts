import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'

const SECRET = process.env.DELETE_TOKEN_SECRET

if (!SECRET) {
  throw new Error('DELETE_TOKEN_SECRET is missing.')
}

const KEY = Buffer.from(SECRET, 'hex')

if (KEY.length !== 32) {
  throw new Error(
    'DELETE_TOKEN_SECRET must contain exactly 32 bytes (64 hexadecimal characters).'
  )
}

export function generateToken (): string {
  return crypto.randomBytes(32).toString('hex')
}

export function encryptToken (token: string) {
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(token, 'utf8', 'hex')

  encrypted += cipher.final('hex')

  return {
    encryptedToken: encrypted,
    iv: iv.toString('hex')
  }
}

export function decryptToken (encryptedToken: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  )

  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8')

  decrypted += decipher.final('utf8')

  return decrypted
}
