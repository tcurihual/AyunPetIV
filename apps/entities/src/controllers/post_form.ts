import { Request, Response } from "express"
import { z } from "zod"
import { supabase } from "../index"

const TABLE = "post_form"

const ListQuerySchema = z.object({
    post_id: z.coerce.number().int().positive(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(200).optional().default(50),
    order: z
        .enum(["created_at.asc", "created_at.desc", "id.asc", "id.desc"])
        .optional()
        .default("created_at.desc"),
})

const CreateBodySchema = z.object({
    id_post: z.number().int().positive(),
    id_question: z.number().int().positive(),
})

const UpdateBodySchema = z
    .object({
        id_post: z.number().int().positive().optional(),
        id_question: z.number().int().positive().optional(),
    })
    .refine((d) => d.id_post !== undefined || d.id_question !== undefined, {
        message: "Debe enviar al menos uno de: id_post, id_question",
        path: ["id_post", "id_question"],
    })

function badRequest(res: Response, message: string, details?: any) {
    return res.status(400).json({ type: "error", message, details })
}

export async function list(req: Request, res: Response) {
    const parsed = ListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
        return badRequest(res, "Parámetros inválidos", parsed.error.flatten())
    }
    const { post_id, page, limit, order } = parsed.data

    const [col, dir] = order.split(".")
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from(TABLE)
        .select(
            `
      id,
      id_post,
      id_question,
      created_at,
      question:question(id, content, type)
      `,
            { count: "exact" }
        )
        .eq("id_post", post_id)
        .order(col as "created_at" | "id", { ascending: dir === "asc" })
        .range(from, to)

    if (error) return res.status(500).json({ type: "error", message: error.message })

    return res.json({
        type: "success",
        message: "OK",
        meta: { page, limit, total: count ?? 0, order },
        data,
    })
}

export async function create(req: Request, res: Response) {
    const parsed = CreateBodySchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(422).json({
            type: "error",
            message: "VALIDATION_ERROR",
            details: parsed.error.flatten(),
        })
    }
    const { id_post, id_question } = parsed.data

    const { data: post, error: postErr } = await supabase
        .from("post")
        .select("id")
        .eq("id", id_post)
        .maybeSingle()
    if (postErr) return res.status(500).json({ type: "error", message: postErr.message })
    if (!post) return res.status(404).json({ type: "error", message: "POST_NOT_FOUND" })

    const { data: question, error: qErr } = await supabase
        .from("question")
        .select("id")
        .eq("id", id_question)
        .maybeSingle()
    if (qErr) return res.status(500).json({ type: "error", message: qErr.message })
    if (!question) return res.status(404).json({ type: "error", message: "QUESTION_NOT_FOUND" })

    const { data: dup, error: dupErr } = await supabase
        .from(TABLE)
        .select("id")
        .eq("id_post", id_post)
        .eq("id_question", id_question)
        .maybeSingle()
    if (dupErr) return res.status(500).json({ type: "error", message: dupErr.message })
    if (dup) return res.status(409).json({ type: "error", message: "ALREADY_EXISTS" })

    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from(TABLE)
        .insert({ id_post, id_question, created_at: now })
        .select(
            `
      id,
      id_post,
      id_question,
      created_at,
      question:question(id, content, type)
      `
        )
        .single()

    if (error) return res.status(500).json({ type: "error", message: error.message })
    return res.status(201).json({ type: "success", message: "CREATED", data })
}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
        return res.status(400).json({ type: "error", message: "id debe ser numérico" })
    }

    const parsed = UpdateBodySchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(422).json({
            type: "error",
            message: "VALIDATION_ERROR",
            details: parsed.error.flatten(),
        })
    }
    const { id_post, id_question } = parsed.data

    const { data: row, error: rowErr } = await supabase
        .from(TABLE)
        .select("id, id_post, id_question")
        .eq("id", id)
        .maybeSingle()

    if (rowErr) return res.status(500).json({ type: "error", message: rowErr.message })
    if (!row) return res.status(404).json({ type: "error", message: "NOT_FOUND" })

    const next_post = id_post ?? row.id_post
    const next_question = id_question ?? row.id_question

    if (typeof next_post !== "number" || typeof next_question !== "number") {
        return res.status(422).json({
            type: "error",
            message: "id_post e id_question no pueden ser null",
        })
    }

    const nextPostNum: number = next_post
    const nextQuestionNum: number = next_question

    if (id_post !== undefined) {
        const { data: post, error: postErr } = await supabase
            .from("post")
            .select("id")
            .eq("id", id_post)
            .maybeSingle()
        if (postErr) return res.status(500).json({ type: "error", message: postErr.message })
        if (!post) return res.status(404).json({ type: "error", message: "POST_NOT_FOUND" })
    }

    if (id_question !== undefined) {
        const { data: question, error: qErr } = await supabase
            .from("question")
            .select("id")
            .eq("id", id_question)
            .maybeSingle()
        if (qErr) return res.status(500).json({ type: "error", message: qErr.message })
        if (!question) return res.status(404).json({ type: "error", message: "QUESTION_NOT_FOUND" })
    }

    if (nextPostNum !== row.id_post || nextQuestionNum !== row.id_question) {
        const { data: dup, error: dupErr } = await supabase
            .from(TABLE)
            .select("id")
            .eq("id_post", nextPostNum)
            .eq("id_question", nextQuestionNum)
            .maybeSingle()
        if (dupErr) return res.status(500).json({ type: "error", message: dupErr.message })
        if (dup && dup.id !== id) {
            return res.status(409).json({ type: "error", message: "ALREADY_EXISTS" })
        }
    }

    const patch: Record<string, any> = {}
    if (id_post !== undefined) patch.id_post = id_post
    if (id_question !== undefined) patch.id_question = id_question

    const { data, error } = await supabase
        .from(TABLE)
        .update(patch)
        .eq("id", id)
        .select(
            `
      id,
      id_post,
      id_question,
      created_at,
      question:question(id, content, type)
      `
        )
        .single()

    if (error) return res.status(500).json({ type: "error", message: error.message })
    return res.json({ type: "success", message: "UPDATED", data })
}

export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return badRequest(res, "id debe ser numérico")

    const { data, error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle()

    if (error) return res.status(500).json({ type: "error", message: error.message })
    if (!data) return res.status(404).json({ type: "error", message: "NOT_FOUND" })

    return res.json({ type: "success", message: "DELETED", data })
}
