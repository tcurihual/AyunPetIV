import axios from "axios"
import FormData from "form-data"
import jwt from "jsonwebtoken"
import { JWT_SECRET, MEDIA_URL } from "@repo/utils"

type FileLike = { buffer: Buffer; originalname: string; mimetype: string }

function signInternalMediaToken(payload: { id: number; email: string; roleId: number }) {
    return jwt.sign(
        {
            sub: payload.id,
            email: payload.email,
            role: payload.roleId,
            aud: "media",
            purpose: "account-request",
        },
        JWT_SECRET,
        { expiresIn: "10m" }
    )
}

export async function sendAccountRequestDocuments(params: {
    user: { id: number; email: string; rut: string; roleId: number }
    files: FileLike[]
}) {
    const fd = new FormData()
    for (const f of params.files) {
        fd.append("documents", f.buffer, { filename: f.originalname, contentType: f.mimetype })
    }

    const token = signInternalMediaToken({
        id: params.user.id,
        email: params.user.email,
        roleId: params.user.roleId,
    })

    const url = `${MEDIA_URL}/uploads/account-request/${encodeURIComponent(params.user.rut)}`

    const headers = {
        Authorization: `Bearer ${token}`,
        "x-user-id": String(params.user.id),
        "x-user-role": String(params.user.roleId),
        ...fd.getHeaders(),
    }

    const res = await axios.post(url, fd, {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 20000,
    })
    return res.data
}
