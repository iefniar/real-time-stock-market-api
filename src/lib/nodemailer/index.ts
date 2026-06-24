import nodemailer from "nodemailer";
import type { WelcomeEmailData } from "../../types/types.ts";
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from "./templates.ts";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
});

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{intro}}', intro);

    const mailOptions = {
        from: 'Real Time Stock Market',
        to: email,
        subject: `Welcome to Real Time Stock Market - make smart moves!`,
        text: 'Thanks for joining Real Time Stock Market',
        html: htmlTemplate
    }

    await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: 'Real Time Stock Market',
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Real Time Stock Market`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};
