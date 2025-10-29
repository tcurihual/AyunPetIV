import React, { createContext, useContext, useMemo, useRef, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"

export interface FormResponse {
    id: number
    id_user: number
    id_post_form: number
    answer: string
    created_at: string
    updated_at: string
}

type LastQuery =
    | { kind: "byPostForm"; id_post_form: number }
    | { kind: "byPublication"; postId: number }
    | null

interface CreateResponsePayload {
    id_post_form: number
    answer: string
}

interface PostResponsesContextType {
    responses: FormResponse[]
    loading: boolean
    error: string | null
    listByPostForm: (id_post_form: number) => Promise<void>
    listByPublication: (postId: number) => Promise<void>
    refresh: () => Promise<void>
    clearError: () => void
    create: (data: CreateResponsePayload) => Promise<FormResponse>
    update: (id: number, answer: string) => Promise<FormResponse>
    remove: (id: number) => Promise<void>
}

const PostResponsesContext = createContext<PostResponsesContextType | null>(null)

export const PostResponsesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [responses, setResponses] = useState<FormResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const lastQueryRef = useRef<LastQuery>(null)
    const { user } = useAuthContext()

    function assertAuthenticated() {
        if (!user) throw new Error("Usuario no autenticado")
    }

    async function listByPostForm(id_post_form: number) {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        lastQueryRef.current = { kind: "byPostForm", id_post_form }
        try {
            const response = await http.get<{
                type: "success" | "error"
                message: string
                data: FormResponse[]
            }>(`/v1/entities/form-responses?id_post_form=${id_post_form}`)

            setResponses(Array.isArray(response.data.data) ? response.data.data : [])
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al obtener respuestas del formulario"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function listByPublication(postId: number) {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        lastQueryRef.current = { kind: "byPublication", postId }
        try {
            const response = await http.get<{
                type: "success" | "error"
                message: string
                data: FormResponse[]
            }>(`/v1/entities/form-responses/publication/${postId}`)

            setResponses(Array.isArray(response.data.data) ? response.data.data : [])
        } catch (e: any) {
            const msg =
                e?.response?.data?.message || "Error al obtener respuestas de la publicación"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function create(data: CreateResponsePayload): Promise<FormResponse> {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        try {
            const id_user = Number(user!.id)
            const response = await http.post<{
                type: "success" | "error"
                message: string
                data: FormResponse
            }>(`/v1/entities/form-responses`, {
                id_user,
                id_post_form: data.id_post_form,
                answer: data.answer,
            })

            const created = response.data.data
            setResponses((prev) => [created, ...prev])
            return created
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al crear respuesta"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function update(id: number, answer: string): Promise<FormResponse> {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        try {
            const response = await http.put<{
                type: "success" | "error"
                message: string
                data: FormResponse
            }>(`/v1/entities/form-responses/${id}`, { answer })

            const updated = response.data.data
            setResponses((prev) => prev.map((r) => (r.id === id ? updated : r)))
            return updated
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al actualizar respuesta"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function remove(id: number): Promise<void> {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        try {
            await http.delete<{
                type: "success" | "error"
                message: string
                data: { id: number }
            }>(`/v1/entities/form-responses/${id}`)

            setResponses((prev) => prev.filter((r) => r.id !== id))
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al eliminar respuesta"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function refresh() {
        if (!lastQueryRef.current) return
        if (lastQueryRef.current.kind === "byPostForm") {
            await listByPostForm(lastQueryRef.current.id_post_form)
        } else if (lastQueryRef.current.kind === "byPublication") {
            await listByPublication(lastQueryRef.current.postId)
        }
    }

    function clearError() {
        setError(null)
    }

    const value = useMemo(
        () => ({
            responses,
            loading,
            error,
            listByPostForm,
            listByPublication,
            refresh,
            clearError,
            create,
            update,
            remove,
        }),
        [responses, loading, error]
    )

    return <PostResponsesContext.Provider value={value}>{children}</PostResponsesContext.Provider>
}

export function usePostResponsesContext() {
    const ctx = useContext(PostResponsesContext)
    if (!ctx) throw new Error("usePostResponsesContext must be used within PostResponsesProvider")
    return ctx
}
