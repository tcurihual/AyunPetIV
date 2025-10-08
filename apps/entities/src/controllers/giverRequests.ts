import type { Request, Response } from "express"
import axios from "axios"
import { createSupabaseClient, MEDIA_URL } from "@repo/utils"

type GiverItem = {
    id: number
    name: string
    email: string
    role: number
    rut: string
    files: string[]
}

export const listGiverRequests = async (_req: Request, res: Response) => {
    const supa = createSupabaseClient()
    const { data: users, error } = await supa
        .from("users")
        .select("id,name,email,role,rut,validated")
        .eq("validated", false)
        .not("role", "in", "(20,19)")
        .order("id", { ascending: true })

    if (error) {
        return res.status(500).json({ type: "error", message: error.message, data: null })
    }

    const items: GiverItem[] = await Promise.all(
        (users ?? []).map(async (u) => {
            const safeName = typeof u.name === "string" ? u.name : ""
            const safeEmail = typeof u.email === "string" ? u.email : ""
            const safeRut = typeof u.rut === "string" ? u.rut : ""

            let files: string[] = []
            try {
                const { data } = await axios.get<string[] | { data?: string[] }>(
                    `${MEDIA_URL}/files/account-request/${safeRut}`
                )
                files = Array.isArray(data)
                    ? data
                    : Array.isArray((data as any)?.data)
                    ? (data as any).data
                    : []
            } catch {
                files = []
            }

            return {
                id: u.id as number,
                name: safeName,
                email: safeEmail,
                role: u.role as number,
                rut: safeRut,
                files,
            }
        })
    )

    return res.json({ type: "success", message: "OK", data: items })
}
