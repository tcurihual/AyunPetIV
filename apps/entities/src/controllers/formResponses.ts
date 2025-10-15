import { Request, Response } from "express"
import { supabase } from "../index"

const TABLE = "form_response"

export async function list(req: Request, res: Response) {
    const idPostForm = Number(req.query.id_post_form)

    if (!idPostForm) {
        return res.status(400).json({ type: "error", message: "El id_post_form es requerido" })
    }

    const { data, error } = await supabase.from(TABLE).select("*").eq("id_post_form", idPostForm)

    if (error) {
        return res.status(500).json({ type: "error", message: error.message })
    }

    return res.json({ type: "success", message: "OK", data })
}

export async function create(req: Request, res: Response) {
    const { id_user, id_post_form, answer } = req.body

    if (!id_user || !id_post_form || !answer) {
        return res.status(400).json({
            type: "error",
            message: "id_user, id_post_form y answer son requeridos",
        })
    }

    const { data, error } = await supabase
        .from(TABLE)
        .insert([
            {
                id_user,
                id_post_form,
                answer,
                created_at: new Date().toISOString(),
            },
        ])
        .select()
        .maybeSingle()

    if (error) {
        return res.status(500).json({ type: "error", message: error.message })
    }

    return res.status(201).json({ type: "success", message: "CREATED", data })
}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { answer } = req.body

    if (!answer) {
        return res.status(400).json({
            type: "error",
            message: "El campo 'answer' es requerido para actualizar",
        })
    }

    const { data, error } = await supabase
        .from(TABLE)
        .update({ answer })
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
}

export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id)

    const { data, error } = await supabase
        .from(TABLE)
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
}

export async function listByPublication(req: Request, res: Response) {
    const postId = Number(req.params.postId)

    if (!postId) {
        return res.status(400).json({ type: "error", message: "postId inválido" })
    }

    const { data: postForms, error: postFormError } = await supabase
        .from("post_form")
        .select("id")
        .eq("post_id", postId)

    if (postFormError) {
        return res.status(500).json({ type: "error", message: postFormError.message })
    }

    const postFormIds = postForms?.map((p) => p.id) || []

    if (postFormIds.length === 0) {
        return res.json({
            type: "success",
            message: "Sin respuestas para esta publicación",
            data: [],
        })
    }

    const { data: responses, error: responsesError } = await supabase
        .from("form_response")
        .select("*")
        .in("id_post_form", postFormIds)

    if (responsesError) {
        return res.status(500).json({ type: "error", message: responsesError.message })
    }

    return res.json({
        type: "success",
        message: "Respuestas obtenidas correctamente",
        data: responses,
    })
}
