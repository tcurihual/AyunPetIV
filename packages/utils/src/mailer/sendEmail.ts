import "dotenv/config"
import nodemailer from "nodemailer"
import { MAIL_USER, MAIL_PASS } from "../constants"

interface EmailOptions {
    to: string
    subject: string
    html: string
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
    console.log("✉️ [sendEmail] Preparando email:", { to, subject })

    if (!MAIL_USER || !MAIL_PASS) {
        console.warn(
            "⚠️ [sendEmail] No hay credenciales de correo (MAIL_USER/MAIL_PASS). " +
                "Se omite envío real en entorno de desarrollo."
        )
        //si no queremos que se lance un error cuando falla el mail ponemos { succes: false }
        return { success: true, dev: true }
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASS,
            },
        })

        const info = await transporter.sendMail({
            from: `"Ayün Pet 🐾" <${MAIL_USER}>`,
            to,
            subject,
            html,
        })

        console.log("✅ [sendEmail] Email enviado:", { to, messageId: info.messageId })
        return { success: true, info }
    } catch (err: any) {
        console.error("❌ [sendEmail] Error al enviar correo:", err?.message || err)
        throw err
    }
}
