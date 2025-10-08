import Queue from "better-queue"
import { sendFakeMail } from "./mailer"

export interface MailTask {
    to: string
    subject: string
    body: string
}

export const mailQueue = new Queue<MailTask, { success: boolean }>(
    async (task, done) => {
        try {
            await sendFakeMail(task.to, task.subject, task.body)
            done(null, { success: true })
        } catch (err) {
            done(err as Error)
        }
    },
    {
        concurrent: 2,
        maxRetries: 3,
        retryDelay: 5000,
    }
)

export function enqueueMail(to: string, subject: string, body: string) {
    mailQueue.push({ to, subject, body })
    console.log(`📨 Correo agregado a la cola en memoria: ${to}`)
}
