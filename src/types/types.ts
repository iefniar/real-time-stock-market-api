export type WelcomeEmailData = {
  email: string
  name: string
  intro: string
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

// My UserForNewsEmail type
export type UserForNewsEmail = {
  id: string
  email: string
  name: string
}
