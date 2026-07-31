import nodemailer from 'nodemailer'
import type {
  WelcomeEmailData,
  WelcomeVerifyEmailData,
  ResetPasswordEmailData
} from '../../types/types.ts'
import {
  WELCOME_EMAIL_TEMPLATE,
  WELCOME_VERIFY_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE
} from './templates.ts'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
})

export const sendWelcomeEmail = async ({
  email,
  name,
  intro
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace(
    '{{intro}}',
    intro
  )

  const mailOptions = {
    from: 'Real Time Stock Market',
    to: email,
    subject: `Welcome to Real Time Stock Market - make smart moves!`,
    text: 'Thanks for joining Real Time Stock Market',
    html: htmlTemplate
  }

  await transporter.sendMail(mailOptions)
}

export const sendWelcomeVerifyEmail = async ({
  email,
  name,
  intro,
  verificationUrl,
  deleteUrl
}: WelcomeVerifyEmailData) => {
  const htmlTemplate = WELCOME_VERIFY_EMAIL_TEMPLATE.replaceAll(
    '{{name}}',
    name
  )
    .replaceAll('{{intro}}', intro)
    .replaceAll('{{verificationUrl}}', verificationUrl)
    .replaceAll('{{deleteUrl}}', deleteUrl)

  const mailOptions = {
    from: 'Real Time Stock Market',
    to: email,
    subject: 'Welcome to Real Time Stock Market — Verify your email',
    text: `
          Thanks for creating your account.

          Please verify your email by visiting the link below:

          ${verificationUrl}
        `,
    html: htmlTemplate
  }

  await transporter.sendMail(mailOptions)
}

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
  deleteUrl
}: {
  email: string
  date: string
  newsContent: string
  deleteUrl?: string
}): Promise<void> => {
  let htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    '{{date}}',
    date
  ).replace('{{newsContent}}', newsContent)

  if (deleteUrl) {
    htmlTemplate = htmlTemplate.replace('{{deleteUrl}}', deleteUrl)
  }

  const mailOptions = {
    from: 'Real Time Stock Market',
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Real Time Stock Market`,
    html: htmlTemplate
  }

  await transporter.sendMail(mailOptions)
}

export const sendResetPasswordEmail = async ({
  email,
  name,
  resetPasswordUrl
}: ResetPasswordEmailData): Promise<void> => {
  const htmlTemplate = RESET_PASSWORD_EMAIL_TEMPLATE.replaceAll(
    '{{name}}',
    name
  ).replaceAll('{{resetPasswordUrl}}', resetPasswordUrl)

  const mailOptions = {
    from: 'Real Time Stock Market',
    to: email,
    subject: 'Reset your password',

    text:
      `Hello ${name},\n\n` +
      `We received a request to reset your password.\n\n` +
      `Reset your password here:\n\n${resetPasswordUrl}\n\n` +
      `If you didn't request this, you can safely ignore this email.`,

    html: htmlTemplate
  }

  await transporter.sendMail(mailOptions)
}
