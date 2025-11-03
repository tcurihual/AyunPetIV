import { Request, Response } from "express"
import { supabase } from "../index"

const TABLE = "form_response"

/**
 * GET /form-responses?id_post_form={id}
 * Lista todas las respuestas de un post_form específico.
 */
export async function list(req: Request, res: Response) {
    const idPostForm = Number(req.query.id_post_form)

    if (!idPostForm || isNaN(idPostForm)) {
        return res.status(400).json({
            type: "error",
            message: "El parámetro 'id_post_form' es requerido y debe ser numérico.",
        })
    }

    const { data, error } = await supabase.from(TABLE).select("*").eq("id_post_form", idPostForm)

    if (error) {
        return res.status(500).json({ type: "error", message: error.message })
    }

    return res.json({ type: "success", message: "OK", data })
}

/**
 * POST /form-responses
 * Crea una nueva respuesta de formulario.
 */
export async function create(req: Request, res: Response) {
    const { id_post_form, answer } = req.body

    if (!id_post_form || !answer) {
        return res.status(400).json({
            type: "error",
            message: "Los campos 'id_post_form' y 'answer' son requeridos.",
        })
    }

    const id_user = (req as any).user?.id

    if (!id_user) {
        return res.status(401).json({
            type: "error",
            message: "Usuario no autenticado",
        })
    }

    const insertPayload = {
        id_user,
        id_post_form,
        answer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from(TABLE)
        .insert([insertPayload])
        .select()
        .maybeSingle()

    if (error) {
        return res.status(500).json({ type: "error", message: error.message })
    }

    return res.status(201).json({
        type: "success",
        message: "Respuesta creada correctamente",
        data,
    })
}

/**
 * PUT /form-responses/:id
 * Actualiza el campo 'answer' de una respuesta existente.
 */
export async function update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { answer } = req.body

    if (isNaN(id)) {
        return res.status(400).json({ type: "error", message: "ID inválido." })
    }

    if (!answer) {
        return res.status(400).json({
            type: "error",
            message: "El campo 'answer' es requerido para actualizar.",
        })
    }

    const { data, error } = await supabase
        .from(TABLE)
        .update({ answer, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle()

    if (error) {
        return res.status(500).json({ type: "error", message: error.message })
    }

    if (!data) {
        return res.status(404).json({ type: "error", message: "Respuesta no encontrada." })
    }

    return res.json({
        type: "success",
        message: "Respuesta actualizada correctamente",
        data,
    })
}

/**
 * DELETE /form-responses/:id
 * Elimina una respuesta de formulario por ID.
 */
export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id)

    if (isNaN(id)) {
        return res.status(400).json({ type: "error", message: "ID inválido." })
    }

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
        return res.status(404).json({ type: "error", message: "Respuesta no encontrada." })
    }

    return res.json({
        type: "success",
        message: "Respuesta eliminada correctamente",
        data: { id: data.id },
    })
}

/**
 * GET /form-responses/publication/:postId
 * Obtiene todas las respuestas asociadas a una publicación.
 */
export async function listByPublication(req: Request, res: Response) {
    const postId = Number(req.params.postId)

    if (isNaN(postId)) {
        return res
            .status(400)
            .json({ type: "error", message: "El parámetro 'postId' es inválido." })
    }

    // Obtener los post_form asociados a la publicación
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
            message: "Sin respuestas para esta publicación.",
            data: [],
        })
    }

    // Buscar todas las respuestas vinculadas a esos post_form
    const { data: responses, error: responsesError } = await supabase
        .from(TABLE)
        .select("*")
        .in("id_post_form", postFormIds)

    if (responsesError) {
        return res.status(500).json({ type: "error", message: responsesError.message })
    }

    return res.json({
        type: "success",
        message: "Respuestas obtenidas correctamente.",
        data: responses,
    })
}
