import { sendWelcomeEmail, sendWelcomeVerifyEmail, sendNewsSummaryEmail } from '../nodemailer/index.js';
import { inngest } from './client.js';
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from './prompts.js';
import { getAllUsersForNewsEmail, getUsersWithNewsEmailEnabled } from '../../services/user.service.js';
import { getWatchlistSymbolsByEmail } from '../../services/watchlist.service.js';
import { getNews } from '../../services/finnhub.service.js';
import { getOrCreateDeleteToken } from '../../services/delete-token.service.js';
import { resetCounter, canProceed, incrementCounter } from '../../services/email-rate-limit.service.js';
import { getFormattedTodayDate } from '../utils.js';
export const resetEmailCounters = inngest.createFunction({
    id: 'reset-email-counters',
    triggers: [
        {
            cron: '0 0 * * *'
        }
    ]
}, async () => {
    await Promise.all([
        resetCounter('total'),
        resetCounter('signup'),
        resetCounter('passwordReset'),
        resetCounter('news')
    ]);
    return {
        success: true,
        message: 'Email counters reset successfully.'
    };
});
export const sendSignUpEmail = inngest.createFunction({
    id: 'sign-up-email',
    triggers: [
        {
            event: 'app/user.created'
        }
    ]
}, async ({ event, step }) => {
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;
    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);
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
    });
    await step.run('send-welcome-email', async () => {
        const part = response.candidates?.[0]?.content?.parts?.[0];
        const introText = (part && 'text' in part ? part.text : null) ||
            'Thanks for joining Real Time Stock Market. You now have the tools to track markets.';
        const { data: { email, name } } = event;
        return await sendWelcomeEmail({ email, name, intro: introText });
    });
    return {
        success: true,
        message: 'Welcome email sent successfully'
    };
});
export const sendWelcomeVerificationEmail = inngest.createFunction({
    id: 'welcome-verification-email',
    triggers: [
        {
            event: 'app/user.verification-email'
        }
    ]
}, async ({ event, step }) => {
    // Build a profile for Gemini
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;
    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);
    // Generate the personalized intro
    const response = await step.ai.infer('generate-welcome-intro', {
        model: step.ai.models.gemini({
            model: 'gemini-2.5-flash-lite'
        }),
        body: {
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        }
    });
    // DeleteToken
    const deleteToken = await step.run('generate-delete-token', async () => {
        return await getOrCreateDeleteToken(event.data.userId);
    });
    const deleteUrl = `${process.env.FRONTEND_URL}/delete-account?token=${deleteToken}`;
    // Send the email
    await step.run('send-welcome-verification-email', async () => {
        const part = response.candidates?.[0]?.content?.parts?.[0];
        const introText = (part && 'text' in part ? part.text : null) ??
            'Thanks for creating your account. Verify your email to start tracking the stock market.';
        return await sendWelcomeVerifyEmail({
            email: event.data.email,
            name: event.data.name,
            intro: introText,
            verificationUrl: event.data.verificationUrl,
            deleteUrl
        });
    });
    return {
        success: true,
        message: 'Welcome verification email sent successfully.'
    };
});
export const sendDailyNewsSummary = inngest.createFunction({
    id: 'daily-news-summary',
    triggers: [
        {
            event: 'app/send.daily.news'
        },
        { cron: '0 9 * * 1,5' } // run at 9:00 am every Monday and Friday
        //{ cron: '*/4 * * * *' } // run every 4 minutes
    ]
}, async ({ step }) => {
    // Step 1: get all users for news delivery
    const users = await step.run('get-all-users', getAllUsersForNewsEmail);
    if (!users || users.length === 0) {
        return { success: false, message: 'No users found for news email' };
    }
    // Step 2: For each user, get watchlist symbols -> fetch news (fallback to general)
    const results = await step.run('fetch-user-news', async () => {
        const perUser = [];
        for (const user of users) {
            try {
                const symbols = await getWatchlistSymbolsByEmail(user.email);
                let articles = await getNews(symbols);
                // Enforce max 6 articles
                articles = (articles || []).slice(0, 6);
                // Fallback to general news
                if (articles.length === 0) {
                    articles = (await getNews()).slice(0, 6);
                }
                perUser.push({
                    user,
                    articles
                });
            }
            catch (e) {
                console.error('daily-news: error preparing user news', user.email, e);
                perUser.push({
                    user,
                    articles: []
                });
            }
        }
        return perUser;
    });
    // Step 3: Summarize news via AI for each user
    const userNewsSummaries = [];
    for (const { user, articles } of results) {
        try {
            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));
            const response = await step.ai.infer(`summarize-news-${user.email}`, {
                model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                body: {
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                }
            });
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.';
            userNewsSummaries.push({ user, newsContent });
        }
        catch (e) {
            console.error('Failed to summarize news for : ', user.email);
            userNewsSummaries.push({ user, newsContent: null });
        }
    }
    // Step 4: Send the emails
    await step.run('send-news-emails', async () => {
        await Promise.all(userNewsSummaries.map(async ({ user, newsContent }) => {
            if (!newsContent)
                return false;
            return await sendNewsSummaryEmail({
                email: user.email,
                date: getFormattedTodayDate(),
                newsContent
            });
        }));
    });
    return {
        success: true,
        message: 'Daily news summary emails sent successfully'
    };
});
export const sendEmailsToUsersWithNewsEnabled = inngest.createFunction({
    id: 'emails-to-users-with-news-enabled',
    triggers: [
        {
            event: 'app/send.emails.to.users.with.news.enabled'
        },
        { cron: '0 11 * * 1,5' } // run at 11:00 am every Monday and Friday
        // { cron: '*/4 * * * *' } // run every 4 minutes
    ]
}, async ({ step }) => {
    /**
     * STEP 1
     * Get ONLY users that:
     * - have at least one stock
     * - AND that stock has isNewsViaEmailActive === true
     */
    const users = await step.run('get-users-with-news-enabled', getUsersWithNewsEmailEnabled);
    if (!users.length) {
        return {
            success: true,
            message: 'No users have news emails enabled.'
        };
    }
    /**
     * STEP 2
     * Fetch company news for each user's enabled symbols
     */
    const userArticles = await step.run('fetch-news', async () => {
        return await Promise.all(users.map(async (user) => {
            try {
                let articles = await getNews(user.symbols);
                articles = articles.slice(0, 6);
                if (articles.length === 0) {
                    articles = (await getNews()).slice(0, 6);
                }
                return {
                    user,
                    articles
                };
            }
            catch (error) {
                console.error(`Failed loading news for ${user.email}`, error);
                return {
                    user,
                    articles: []
                };
            }
        }));
    });
    /**
     * STEP 3
     * AI summary
     */
    const summaries = [];
    for (const { user, articles } of userArticles) {
        try {
            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));
            const response = await step.ai.infer(`summarize-${user.id}`, {
                model: step.ai.models.gemini({
                    model: 'gemini-2.5-flash-lite'
                }),
                body: {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }
            });
            const part = response.candidates?.[0]?.content?.parts?.[0];
            summaries.push({
                user,
                newsContent: (part && 'text' in part ? part.text : null) ?? 'No market news.'
            });
        }
        catch (error) {
            console.error(`AI summary failed for ${user.email}`, error);
            summaries.push({
                user,
                newsContent: null
            });
        }
    }
    /**
     * STEP 4
     * Send emails
     */
    let emailsSent = 0;
    await step.run('send-emails', async () => {
        for (const { user, newsContent } of summaries) {
            if (!newsContent) {
                continue;
            }
            const allowed = await canProceed('news');
            if (!allowed) {
                console.warn('Daily news email limit reached.');
                break;
            }
            // Delete Token
            const deleteToken = await getOrCreateDeleteToken(user.id);
            const deleteUrl = `${process.env.FRONTEND_URL}/delete-account?token=${deleteToken}`;
            await sendNewsSummaryEmail({
                email: user.email,
                date: getFormattedTodayDate(),
                newsContent,
                deleteUrl
            });
            await incrementCounter('news');
            await incrementCounter('total');
            emailsSent++;
        }
    });
    return {
        success: true,
        usersProcessed: users.length,
        emailsSent
    };
});
