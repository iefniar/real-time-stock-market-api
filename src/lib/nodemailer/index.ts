import nodemailer from "nodemailer";
import type { WelcomeEmailData } from "../../types/types.ts";
import { WELCOME_EMAIL_TEMPLATE } from "./templates.ts";

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
