export type WelcomeEmailData = {
  email: string
  name: string
  intro: string
}

export type WelcomeVerifyEmailData = {
  email: string
  name: string
  intro: string
  verificationUrl: string
}

export type VerificationEmailUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  country: string
  investmentGoals: string
  riskTolerance: string
  preferredIndustry: string
  createdAt: Date
  updatedAt: Date
}

export type RawNewsArticle = {
  id: number
  headline?: string
  summary?: string
  source?: string
  url?: string
  datetime?: number
  image?: string
  category?: string
  related?: string
}

export type Alert = {
  id: string
  symbol: string
  company: string
  alertName: string
  currentPrice: number
  alertType: 'upper' | 'lower'
  threshold: number
  changePercent?: number
}

export type MarketNewsArticle = {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  datetime: number
  category: string
  related: string
  image?: string
}

export type UserForNewsEmail = {
  id: string
  email: string
  name: string
}

export type UserWithNewsEmailEnabled = {
  id: string
  email: string
  name: string
  symbols: string[]
}
