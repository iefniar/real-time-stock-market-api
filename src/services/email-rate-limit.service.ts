import { EmailRateLimit } from '../models/email-rate-limit.model.js'
import { EMAIL_LIMITS } from '../types/constants.js'
import type { EmailCategory } from '../types/types.js'

export async function initializeCounter (category: EmailCategory): Promise<void> {
  await EmailRateLimit.findOneAndUpdate(
    {
      category
    },
    {
      $setOnInsert: {
        category,
        count: 0
      }
    },
    {
      upsert: true
    }
  )
}

export async function getCounter (category: EmailCategory): Promise<number> {
  const document = await EmailRateLimit.findOne({
    category
  })

  console.log(
    `getCounter called for category: ${category}, counter value: ${document?.count}`
  )

  return document?.count ?? 0
}

export async function incrementCounter (category: EmailCategory): Promise<void> {
  await EmailRateLimit.findOneAndUpdate(
    {
      category
    },
    {
      $inc: {
        count: 1
      }
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true
    }
  )
  console.log(`incrementCounter called for category: ${category}`)
}

export async function resetCounter (category: EmailCategory): Promise<void> {
  await EmailRateLimit.findOneAndUpdate(
    {
      category
    },
    {
      count: 0
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true
    }
  )
  console.log(`resetCounter called for category: ${category}`)
}

export async function canProceed (category: EmailCategory): Promise<boolean> {
  console.log(`canProceed called for category: ${category}`)

  const totalCount = await getCounter('total')
  const categoryCount = await getCounter(category)

  return (
    totalCount < EMAIL_LIMITS.total && categoryCount < EMAIL_LIMITS[category]
  )
}
