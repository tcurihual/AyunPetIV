import nodemailer from "nodemailer"
import { MAIL_USER, MAIL_PASS } from "../constants"

interface EmailOptions {
    to: string
    subject: string
    html: string
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: `"Ayün Pet 🐾" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
    })
}
