import { EmailRateLimit } from '../models/email-rate-limit.model.ts'
import { EMAIL_LIMITS } from '../types/constants.ts'
import type { EmailCategory } from '../types/types.ts'

export async function getCounter (category: EmailCategory): Promise<number> {
  const document = await EmailRateLimit.findOne({
    category
  })

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
      new: true,
      setDefaultsOnInsert: true
    }
  )
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
      new: true,
      setDefaultsOnInsert: true
    }
  )
}

export async function canProceed (category: EmailCategory): Promise<boolean> {
  const totalCount = await getCounter('total')
  const categoryCount = await getCounter(category)

  return (
    totalCount < EMAIL_LIMITS.total && categoryCount < EMAIL_LIMITS[category]
  )
}
