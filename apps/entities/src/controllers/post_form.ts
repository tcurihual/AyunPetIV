import { Request, Response } from "express"
import { PostFormCreateSchema, PostFormUpdateSchema } from "@repo/utils/src/schemas/entities"
import { supabase } from "../index"

const TABLE = "post_form"

export async function list(req: Request, res: Response) {
  const postId = Number(req.query.post_id)

  if (!postId) {
    return res.status(400).json({ type: "error", message: "El post_id es requerido" })
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("post_id", postId)

  if (error) return res.status(500).json({ type: "error", message: error.message })

  return res.json({ type: "success", message: "OK", data })
}

export async function create(req: Request, res: Response) {
  const parsed = PostFormCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      type: "error",
      message: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    })
  }

  const { post_id, question_id, answer, active } = parsed.data

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      post_id,
      question_id,
      answer,
      active: active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle()

  if (error) return res.status(500).json({ type: "error", message: error.message })

  return res.status(201).json({ type: "success", message: "CREATED", data })
}

// export async function update(req: Request, res: Response) {
//   const id = Number(req.params.id)
//   const parsed = PostFormUpdateSchema.safeParse(req.body)
//   if (!parsed.success) {
//     return res.status(400).json({
//       type: "error",
//       message: "VALIDATION_ERROR",
//       details: parsed.error.flatten(),
//     })
//   }

//   const { answer, active } = parsed.data

//   const { data, error } = await supabase
//     .from(TABLE)
//     .update({
//       answer,
//       active,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", id)
//     .select()
//     .maybeSingle()

//   if (error) return res.status(500).json({ type: "error", message: error.message })
//   if (!data) return res.status(404).json({ type: "error", message: "NOT_FOUND" })

//   return res.json({ type: "success", message: "UPDATED", data })
// }

// export async function remove(req: Request, res: Response) {
//   const id = Number(req.params.id)

//   const { data, error } = await supabase
//     .from(TABLE)
//     .update({ active: false, updated_at: new Date().toISOString() })
//     .eq("id", id)
//     .select("id")
//     .maybeSingle()

//   if (error) return res.status(500).json({ type: "error", message: error.message })
//   if (!data) return res.status(404).json({ type: "error", message: "NOT_FOUND" })

//   return res.json({ type: "success", message: "DELETED", data: { id: data.id } })
// }