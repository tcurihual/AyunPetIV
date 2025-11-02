import { Request, Response } from "express"
import { QuestionCreateSchema, QuestionUpdateSchema } from "@repo/utils"
import { supabase } from "../index"

export const listQuestions = async (req: Request, res: Response) => {
    const { q, page = "1", pageSize = "20" } = req.query as any
    const take = Math.max(1, Math.min(100, parseInt(pageSize)))
    const from = (Math.max(1, parseInt(page)) - 1) * take

    try {
        let supabaseQuery = supabase
            .from("question")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })

        // Encadenamos filtros condicionalmente
        if (typeof q === "string" && q.trim()) {
            supabaseQuery = supabaseQuery.ilike("content", `%${q}%`)
        }

        const { data, error, count } = await supabaseQuery.range(from, from + take - 1)

        if (error) return res.status(500).json({ type: "error", message: error.message })

        return res.json({
            type: "success",
            message: "OK",
            data,
            page: Number(page),
            pageSize: take,
            total: count,
        })
    } catch (err) {
        return res
            .status(500)
            .json({ type: "error", message: "Error interno del servidor", details: err })
    }
}

export const getQuestionById = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const { data, error } = await supabase
            .from("question")
            .select("*")
            .eq("id", id)
            .maybeSingle()

        if (error) {
            return res.status(500).json({ type: "error", message: error.message })
        }

        if (!data) {
            return res.status(404).json({ type: "error", message: "NOT_FOUND" })
        }

        return res.json({ type: "success", message: "OK", data })
    } catch (err) {
        return res
            .status(500)
            .json({ type: "error", message: "Error interno del servidor", details: err })
    }
}

export const createQuestion = async (req: Request, res: Response) => {
    const parsed = QuestionCreateSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            type: "error",
            message: "VALIDATION_ERROR",
            details: parsed.error.flatten(),
        })
    }

    try {
        const { data, error } = await supabase
            .from("question")
            .insert(parsed.data)
            .select()
            .maybeSingle()

        if (error) {
            return res.status(500).json({ type: "error", message: error.message })
        }

        return res.status(201).json({ type: "success", message: "CREATED", data })
    } catch (err) {
        return res
            .status(500)
            .json({ type: "error", message: "Error interno del servidor", details: err })
    }
}

export const updateQuestion = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const parsed = QuestionUpdateSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            type: "error",
            message: "VALIDATION_ERROR",
            details: parsed.error.flatten(),
        })
    }

    try {
        const { data, error } = await supabase
            .from("question")
            .update({ ...parsed.data, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .maybeSingle()

        if (error) {
            return res.status(500).json({ type: "error", message: error.message })
        }

        if (!data) {
            return res.status(404).json({ type: "error", message: "NOT_FOUND" })
        }

        return res.json({ type: "success", message: "UPDATED", data })
    } catch (err) {
        return res
            .status(500)
            .json({ type: "error", message: "Error interno del servidor", details: err })
    }
}

export const deleteQuestion = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const { data, error } = await supabase
            .from("question")
            .delete()
            .eq("id", id)
            .select("id")
            .maybeSingle()

        if (error) {
            return res.status(500).json({ type: "error", message: error.message })
        }

        if (!data) {
            return res.status(404).json({ type: "error", message: "NOT_FOUND" })
        }

        return res.json({ type: "success", message: "DELETED", data: { id: data.id } })
    } catch (err) {
        return res
            .status(500)
            .json({ type: "error", message: "Error interno del servidor", details: err })
    }
}
