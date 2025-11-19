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
    post_id: z.number().int().positive(),
    question_id: z.number().int().positive(),
})

const UpdateBodySchema = z
    .object({
        post_id: z.number().int().positive().optional(),
        question_id: z.number().int().positive().optional(),
    })
    .refine((d) => d.post_id !== undefined || d.question_id !== undefined, {
        message: "Debe enviar al menos uno de: post_id, question_id",
        path: ["post_id", "question_id"],
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
      post_id,
      question_id,
      created_at,
      question:question(id, content, type)
      `,
            { count: "exact" }
        )
        .eq("post_id", post_id)
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
        console.error("❌ Validation error en post_form create:", parsed.error.flatten())
        return res.status(422).json({
            type: "error",
            message: "VALIDATION_ERROR",
            details: parsed.error.flatten(),
        })
    }
    const { post_id, question_id } = parsed.data
    console.log(`📋 Creating post_form: post_id=${post_id}, question_id=${question_id}`)

    const { data: post, error: postErr } = await supabase
        .from("post")
        .select("id")
        .eq("id", post_id)
        .maybeSingle()
    if (postErr) {
        console.error("❌ Error checking post existence:", postErr.message)
        return res.status(500).json({ type: "error", message: postErr.message })
    }
    if (!post) {
        console.error(`❌ POST_NOT_FOUND: post_id=${post_id}`)
        return res.status(404).json({ type: "error", message: "POST_NOT_FOUND" })
    }
    console.log(`✅ Post exists: id=${post.id}`)

    const { data: question, error: qErr } = await supabase
        .from("question")
        .select("id")
        .eq("id", question_id)
        .maybeSingle()
    if (qErr) {
        console.error("❌ Error checking question existence:", qErr.message)
        return res.status(500).json({ type: "error", message: qErr.message })
    }
    if (!question) {
        console.error(`❌ QUESTION_NOT_FOUND: question_id=${question_id}`)
        return res.status(404).json({ type: "error", message: "QUESTION_NOT_FOUND" })
    }
    console.log(`✅ Question exists: id=${question.id}`)

    console.log(`🔍 Checking for duplicates...`)
    const { data: dup, error: dupErr } = await supabase
        .from(TABLE)
        .select("id")
        .eq("post_id", post_id)
        .eq("question_id", question_id)
        .maybeSingle()
    if (dupErr) {
        console.error("❌ Error checking duplicates:", dupErr.message)
        return res.status(500).json({ type: "error", message: dupErr.message })
    }
    if (dup) {
        console.error(`❌ ALREADY_EXISTS: duplicate found with id=${dup.id}`)
        return res.status(409).json({ type: "error", message: "ALREADY_EXISTS" })
    }
    console.log(`✅ No duplicates found`)

    const now = new Date().toISOString()
    console.log(
        `💾 Inserting into database: post_id=${post_id}, question_id=${question_id}, created_at=${now}`
    )
    const { data, error } = await supabase
        .from(TABLE)
        .insert({ post_id, question_id, created_at: now })
        .select(
            `
      id,
      post_id,
      question_id,
      created_at,
      question:question(id, content, type)
      `
        )
        .single()

    if (error) {
        console.error("❌ Error inserting post_form:", error)
        console.error("❌ Error details:", JSON.stringify(error, null, 2))
        return res.status(500).json({ type: "error", message: error.message })
    }
    console.log(`✅ post_form created successfully:`, data)
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
    const { post_id, question_id } = parsed.data

    const { data: row, error: rowErr } = await supabase
        .from(TABLE)
        .select("id, post_id, question_id")
        .eq("id", id)
        .maybeSingle<{ id: number; post_id: number; question_id: number }>()

    if (rowErr) return res.status(500).json({ type: "error", message: rowErr.message })
    if (!row) return res.status(404).json({ type: "error", message: "NOT_FOUND" })

    const next_post = post_id ?? row.post_id
    const next_question = question_id ?? row.question_id

    if (typeof next_post !== "number" || typeof next_question !== "number") {
        return res.status(422).json({
            type: "error",
            message: "post_id e question_id no pueden ser null",
        })
    }

    const nextPostNum: number = next_post
    const nextQuestionNum: number = next_question

    if (post_id !== undefined) {
        const { data: post, error: postErr } = await supabase
            .from("post")
            .select("id")
            .eq("id", post_id)
            .maybeSingle()
        if (postErr) return res.status(500).json({ type: "error", message: postErr.message })
        if (!post) return res.status(404).json({ type: "error", message: "POST_NOT_FOUND" })
    }

    if (question_id !== undefined) {
        const { data: question, error: qErr } = await supabase
            .from("question")
            .select("id")
            .eq("id", question_id)
            .maybeSingle()
        if (qErr) return res.status(500).json({ type: "error", message: qErr.message })
        if (!question) return res.status(404).json({ type: "error", message: "QUESTION_NOT_FOUND" })
    }

    if (nextPostNum !== row.post_id || nextQuestionNum !== row.question_id) {
        const { data: dup, error: dupErr } = await supabase
            .from(TABLE)
            .select("id")
            .eq("post_id", nextPostNum)
            .eq("question_id", nextQuestionNum)
            .maybeSingle()
        if (dupErr) return res.status(500).json({ type: "error", message: dupErr.message })
        if (dup && dup.id !== id) {
            return res.status(409).json({ type: "error", message: "ALREADY_EXISTS" })
        }
    }

    const patch: Record<string, any> = {}
    if (post_id !== undefined) patch.post_id = post_id
    if (question_id !== undefined) patch.question_id = question_id

    const { data, error } = await supabase
        .from(TABLE)
        .update(patch)
        .eq("id", id)
        .select(
            `
      id,
      post_id,
      question_id,
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
