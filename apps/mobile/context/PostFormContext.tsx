import React, { createContext, useContext, useMemo, useRef, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"

export type QuestionType = "text" | "number" | "boolean" | "select" | "multiselect"

export interface PostFormItem {
    id: number
    post_id: number
    question_id: number
    created_at: string
    question: {
        id: number
        content: string
        type: QuestionType
    }
}

export interface ListPostFormParams {
    post_id: number
    page?: number
    limit?: number
    order?: "created_at.asc" | "created_at.desc" | "id.asc" | "id.desc"
}

export interface CreatePostFormPayload {
    post_id: number
    question_id: number
}

export type UpdatePostFormPayload = Partial<CreatePostFormPayload>

interface PostFormContextType {
    items: PostFormItem[]
    loading: boolean
    error: string | null
    // Read
    listByPost: (params: ListPostFormParams) => Promise<void>
    getOne: (id: number) => Promise<PostFormItem | null>
    refresh: () => Promise<void>
    clearError: () => void
    // Write
    create: (data: CreatePostFormPayload) => Promise<PostFormItem>
    update: (id: number, data: UpdatePostFormPayload) => Promise<PostFormItem>
    remove: (id: number) => Promise<void>
}

const PostFormContext = createContext<PostFormContextType | null>(null)

export const PostFormProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [items, setItems] = useState<PostFormItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const lastParamsRef = useRef<ListPostFormParams | null>(null)
    const { user } = useAuthContext()

    async function listByPost(params: ListPostFormParams) {
        setLoading(true)
        setError(null)
        lastParamsRef.current = params
        try {
            const search = new URLSearchParams()
            search.set("post_id", String(params.post_id))
            if (params.page) search.set("page", String(params.page))
            if (params.limit) search.set("limit", String(params.limit))
            if (params.order) search.set("order", params.order)

            const response = await http.get<{
                type: "success" | "error"
                message: string
                data: PostFormItem[]
                meta: { page: number; limit: number; total: number; order: string }
            }>(`/v1/entities/post-form?${search.toString()}`)

            setItems(Array.isArray(response.data.data) ? response.data.data : [])
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al obtener formularios del post"
            setError(msg)
            console.error(msg, e)
        } finally {
            setLoading(false)
        }
    }

    async function getOne(id: number): Promise<PostFormItem | null> {
        // No existe endpoint específico GET /:id en backend actual.
        // Como alternativa, se buscan en cache local.
        const cached = items.find((x) => x.id === id) || null
        return cached
    }

    async function create(data: CreatePostFormPayload): Promise<PostFormItem> {
        setLoading(true)
        setError(null)
        try {
            const response = await http.post<{
                type: "success" | "error"
                message: string
                data: PostFormItem
            }>(`/v1/entities/post-form`, data)

            const created = response.data.data
            setItems((prev) => [created, ...prev])
            return created
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al crear asociación de formulario"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function update(id: number, data: UpdatePostFormPayload): Promise<PostFormItem> {
        setLoading(true)
        setError(null)
        try {
            const response = await http.patch<{
                type: "success" | "error"
                message: string
                data: PostFormItem
            }>(`/v1/entities/post-form/${id}`, data)

            const updated = response.data.data
            setItems((prev) => prev.map((it) => (it.id === id ? updated : it)))
            return updated
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al actualizar asociación de formulario"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function remove(id: number): Promise<void> {
        setLoading(true)
        setError(null)
        try {
            await http.delete<{
                type: "success" | "error"
                message: string
                data: { id: number }
            }>(`/v1/entities/post-form/${id}`)

            setItems((prev) => prev.filter((it) => it.id !== id))
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al eliminar asociación de formulario"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function refresh() {
        if (lastParamsRef.current) {
            await listByPost(lastParamsRef.current)
        }
    }

    function clearError() {
        setError(null)
    }

    const value = useMemo(
        () => ({
            items,
            loading,
            error,
            listByPost,
            getOne,
            refresh,
            clearError,
            create,
            update,
            remove,
        }),
        [items, loading, error]
    )

    return <PostFormContext.Provider value={value}>{children}</PostFormContext.Provider>
}

export function usePostFormContext() {
    const ctx = useContext(PostFormContext)
    if (!ctx) throw new Error("usePostFormContext must be used within PostFormProvider")
    return ctx
}
