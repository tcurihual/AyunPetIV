import React, { createContext, useContext, useMemo, useRef, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"

export type QuestionType = "text" | "number" | "boolean" | "select" | "multiselect"

export interface Question {
    id: number
    content: string
    type: QuestionType
    created_at: string
    updated_at: string
    active: boolean
}

export interface CreateQuestionPayload {
    content: string
    type: QuestionType
    active?: boolean
}

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>

interface GetParams {
    q?: string
    active?: boolean
    page?: number
    pageSize?: number
}

interface QuestionsContextType {
    questions: Question[]
    loading: boolean
    error: string | null
    getQuestions: (params?: GetParams) => Promise<void>
    getQuestionById: (id: number) => Promise<Question | null>
    refreshQuestions: () => Promise<void>
    clearError: () => void
    createQuestion: (data: CreateQuestionPayload) => Promise<Question>
    updateQuestion: (id: number, data: UpdateQuestionPayload) => Promise<Question>
    deleteQuestion: (id: number) => Promise<void>
}

const QuestionContext = createContext<QuestionsContextType | null>(null)

export const QuestionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const lastParamsRef = useRef<GetParams | undefined>(undefined)
    const { user } = useAuthContext()

    function assertAuthenticated() {
        if (!user) throw new Error("Usuario no autenticado")
    }

    function assertAdmin() {
        assertAuthenticated()
        if (user!.role !== 19) throw new Error("Solo administradores pueden realizar esta acción")
    }

    async function getQuestions(params?: GetParams) {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        lastParamsRef.current = params

        try {
            const search = new URLSearchParams()
            if (params?.q) search.set("q", params.q)
            if (typeof params?.active === "boolean") search.set("active", String(params.active))
            if (params?.page) search.set("page", String(params.page))
            if (params?.pageSize) search.set("pageSize", String(params.pageSize))

            const qs = search.toString()
            const url = `/v1/entities/questions${qs ? `?${qs}` : ""}`

            const response = await http.get<{
                type: "success" | "error"
                message: string
                data: Question[]
                page?: number
                pageSize?: number
                total?: number
            }>(url)

            const items = Array.isArray(response.data.data) ? response.data.data : []
            setQuestions(items)
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al obtener preguntas"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function getQuestionById(id: number): Promise<Question | null> {
        assertAuthenticated()
        setLoading(true)
        setError(null)
        try {
            const response = await http.get<{
                type: "success" | "error"
                message: string
                data: Question
            }>(`/v1/entities/questions/${id}`)
            return response.data.data || null
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al obtener la pregunta"
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }

    async function createQuestion(data: CreateQuestionPayload): Promise<Question> {
        assertAdmin()
        setLoading(true)
        setError(null)
        try {
            const response = await http.post<{
                type: "success" | "error"
                message: string
                data: Question
            }>("/v1/entities/questions", data)

            const created = response.data.data
            setQuestions((prev) => [created, ...prev])
            return created
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al crear pregunta"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function updateQuestion(id: number, data: UpdateQuestionPayload): Promise<Question> {
        assertAdmin()
        setLoading(true)
        setError(null)
        try {
            const response = await http.patch<{
                type: "success" | "error"
                message: string
                data: Question
            }>(`/v1/entities/questions/${id}`, data)

            const updated = response.data.data
            setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)))
            return updated
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al actualizar pregunta"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function deleteQuestion(id: number): Promise<void> {
        assertAdmin()
        setLoading(true)
        setError(null)
        try {
            await http.delete<{
                type: "success" | "error"
                message: string
                data: { id: number }
            }>(`/v1/entities/questions/${id}`)

            setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, active: false } : q)))
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Error al eliminar pregunta"
            setError(msg)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function refreshQuestions() {
        return getQuestions(lastParamsRef.current)
    }

    function clearError() {
        setError(null)
    }

    const value = useMemo(
        () => ({
            questions,
            loading,
            error,
            getQuestions,
            getQuestionById,
            refreshQuestions,
            clearError,
            createQuestion,
            updateQuestion,
            deleteQuestion,
        }),
        [questions, loading, error]
    )

    return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>
}

export function useQuestionContext() {
    const ctx = useContext(QuestionContext)
    if (!ctx) throw new Error("useQuestionContext debe ser usado dentro de QuestionProvider")
    return ctx
}
