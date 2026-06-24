import { sendWelcomeEmail, sendNewsSummaryEmail } from '../nodemailer/index.ts'
import { inngest } from './client.ts'
import {
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
  NEWS_SUMMARY_EMAIL_PROMPT
} from './prompts.ts'
import { getAllUsersForNewsEmail } from '../../services/user.service.ts'
import { getWatchlistSymbolsByEmail } from '../../services/watchlist.service.ts'
import { getNews } from '../../services/finnhub.service.ts'
import { getFormattedTodayDate } from '../utils.ts'
import type { MarketNewsArticle, UserForNewsEmail } from '../../types/types.ts'

export const sendSignUpEmail = inngest.createFunction(
  {
    id: 'sign-up-email',
    triggers: [
      {
        event: 'app/user.created'
      }
    ]
  },

  async ({ event, step }) => {
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      '{{userProfile}}',
      userProfile
    )
    const response = await step.ai.infer('generate-welcome-intro', {
      model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
      body: {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      }
    })

    await step.run('send-welcome-email', async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0]
      const introText =
        (part && 'text' in part ? part.text : null) ||
        'Thanks for joining Real Time Stock Market. You now have the tools to track markets.'

      const {
        data: { email, name }
      } = event
      return await sendWelcomeEmail({ email, name, intro: introText })
    })

    return {
      success: true,
      message: 'Welcome email sent successfully'
    }
  }
)

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: 'daily-news-summary',
    triggers: [
      {
        event: 'app/send.daily.news'
      },
      { cron: '0 11 * * 1,5' }
      //{ cron: '*/4 * * * *' } // run every 4 minutes
    ]
  },
  async ({ step }) => {
    // Step 1: get all users for news delivery
    const users = await step.run('get-all-users', getAllUsersForNewsEmail)
    if (!users || users.length === 0) {
      return { success: false, message: 'No users found for news email' }
    }

    // Step 2: For each user, get watchlist symbols -> fetch news (fallback to general)
    const results = await step.run('fetch-user-news', async () => {
      const perUser: Array<{
        user: UserForNewsEmail
        articles: MarketNewsArticle[]
      }> = []

      for (const user of users as UserForNewsEmail[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email)

          let articles = await getNews(symbols)

          // Enforce max 6 articles
          articles = (articles || []).slice(0, 6)

          // Fallback to general news
          if (articles.length === 0) {
            articles = (await getNews()).slice(0, 6)
          }

          perUser.push({
            user,
            articles
          })
        } catch (e) {
          console.error('daily-news: error preparing user news', user.email, e)

          perUser.push({
            user,
            articles: []
          })
        }
      }

      return perUser
    })

    // Step 3: Summarize news via AI for each user
    const userNewsSummaries: {
      user: UserForNewsEmail
      newsContent: string | null
    }[] = []

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          '{{newsData}}',
          JSON.stringify(articles, null, 2)
        )

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
          body: {
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          }
        })

        const part = response.candidates?.[0]?.content?.parts?.[0]
        const newsContent =
          (part && 'text' in part ? part.text : null) || 'No market news.'

        userNewsSummaries.push({ user, newsContent })
      } catch (e) {
        console.error('Failed to summarize news for : ', user.email)
        userNewsSummaries.push({ user, newsContent: null })
      }
    }

    // Step 4: Send the emails
    await step.run('send-news-emails', async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent
          })
        })
      )
    })

    return {
      success: true,
      message: 'Daily news summary emails sent successfully'
    }
  }
)
