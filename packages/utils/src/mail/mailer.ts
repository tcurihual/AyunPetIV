export async function sendFakeMail(to: string, subject: string, body: string) {
    console.log(`📧 [FAKE] Enviando correo a ${to}: ${subject}`)
    await new Promise((r) => setTimeout(r, 1000))
    console.log(`✅ [FAKE] Correo enviado a ${to}`)
}
