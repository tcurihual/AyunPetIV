// context/SavedPostsContext.tsx

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"

export interface SavedPostPet {
    id: number
    name: string
    species: string
    gender: string
    size: string
    sterilized: boolean
    adopted: boolean
    age_years: number
    age_months: number
    images?: string[]
}

export interface SavedPostPost {
    id: number
    title: string
    description: string
    status: string
    created_at: string
    updated_at: string
    creator_id: number
    pet_id: number | null
    images?: string[]
    pet: SavedPostPet | null
}

export interface SavedPostItem {
    id: number
    post_id: number | null
    user_id: number | null
    post: SavedPostPost | null
}

interface SavedPostsResponse {
    items: SavedPostItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

interface CheckSavedResponse {
    is_saved: boolean
    saved_post_id: number | null
}

interface SavedPostsContextType {
    savedPosts: SavedPostItem[]
    loading: boolean
    error: string | null

    page: number
    pageSize: number
    total: number
    totalPages: number

    fetchSavedPosts: (page?: number, pageSize?: number) => Promise<void>
    savePost: (postId: number) => Promise<SavedPostItem>
    removeSavedPostById: (savedPostId: number) => Promise<void>
    removeSavedPostByPostId: (postId: number) => Promise<void>
    checkIfPostIsSaved: (postId: number) => Promise<CheckSavedResponse>
}

const SavedPostsContext = createContext<SavedPostsContextType | null>(null)

export const SavedPostsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const { user } = useAuthContext()

    /**
     * GET /saved-posts
     */
    const fetchSavedPosts = useCallback(
        async (pageArg?: number, pageSizeArg?: number) => {
            if (!user) {
                setError("Usuario no autenticado")
                return
            }

            const effectivePage = pageArg ?? page
            const effectivePageSize = pageSizeArg ?? pageSize

            setLoading(true)
            setError(null)

            try {
                const response = await http.get<{
                    type: string
                    message: string
                    data: SavedPostsResponse
                }>("v1/adoptions/saved-posts", {
                    params: {
                        page: effectivePage,
                        pageSize: effectivePageSize,
                    },
                })

                const data = response.data.data
                if (data) {
                    setSavedPosts(data.items)
                    setPage(data.page)
                    setPageSize(data.pageSize)
                    setTotal(data.total)
                    setTotalPages(data.totalPages)
                }
            } catch (e: any) {
                const errorMessage =
                    e?.response?.data?.message || "Error al obtener publicaciones guardadas"
                setError(errorMessage)
                console.error("Error fetching saved posts:", e)
            } finally {
                setLoading(false)
            }
        },
        [user, page, pageSize]
    )

    /**
     * POST /saved-posts
     */
    const savePost = useCallback(
        async (postId: number): Promise<SavedPostItem> => {
            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            setLoading(true)
            setError(null)

            try {
                const response = await http.post<{
                    type: string
                    message: string
                    data: SavedPostItem
                }>("v1/adoptions/saved-posts", {
                    post_id: postId,
                })

                const savedPost = response.data.data

                setSavedPosts((prev) => {
                    const exists = prev.some((sp) => sp.id === savedPost.id)
                    if (exists) return prev
                    return [savedPost, ...prev]
                })

                return savedPost
            } catch (e: any) {
                const errorMessage = e?.response?.data?.message || "Error al guardar publicación"
                setError(errorMessage)
                console.error("Error saving post:", e)
                throw e
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    /**
     * DELETE /saved-posts/:id
     */
    const removeSavedPostById = useCallback(
        async (savedPostId: number): Promise<void> => {
            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            setLoading(true)
            setError(null)

            try {
                await http.delete(`v1/adoptions/saved-posts/${savedPostId}`)

                setSavedPosts((prev) => prev.filter((sp) => sp.id !== savedPostId))
            } catch (e: any) {
                const errorMessage =
                    e?.response?.data?.message || "Error al eliminar publicación de guardados"
                setError(errorMessage)
                console.error("Error removing saved post:", e)
                throw e
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    /**
     * DELETE /saved-posts/post/:postId
     */
    const removeSavedPostByPostId = useCallback(
        async (postId: number): Promise<void> => {
            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            setLoading(true)
            setError(null)

            try {
                await http.delete(`v1/adoptions/saved-posts/post/${postId}`)

                setSavedPosts((prev) => prev.filter((sp) => sp.post_id !== postId))
            } catch (e: any) {
                const errorMessage =
                    e?.response?.data?.message || "Error al eliminar publicación de guardados"
                setError(errorMessage)
                console.error("Error removing saved post by postId:", e)
                throw e
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    /**
     * GET /saved-posts/check/:postId
     */
    const checkIfPostIsSaved = useCallback(
        async (postId: number): Promise<CheckSavedResponse> => {
            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            try {
                const response = await http.get<{
                    type: string
                    message: string
                    data: CheckSavedResponse
                }>(`v1/adoptions/saved-posts/check/${postId}`)

                return response.data.data
            } catch (e: any) {
                const errorMessage =
                    e?.response?.data?.message ||
                    "Error al verificar si la publicación está guardada"
                console.error("Error checking if post is saved:", e)
                throw new Error(errorMessage)
            }
        },
        [user]
    )

    const value = useMemo(
        () => ({
            savedPosts,
            loading,
            error,
            page,
            pageSize,
            total,
            totalPages,
            fetchSavedPosts,
            savePost,
            removeSavedPostById,
            removeSavedPostByPostId,
            checkIfPostIsSaved,
        }),
        [
            savedPosts,
            loading,
            error,
            page,
            pageSize,
            total,
            totalPages,
            fetchSavedPosts,
            savePost,
            removeSavedPostById,
            removeSavedPostByPostId,
            checkIfPostIsSaved,
        ]
    )

    return <SavedPostsContext.Provider value={value}>{children}</SavedPostsContext.Provider>
}

export const useSavedPostsContext = () => {
    const ctx = useContext(SavedPostsContext)
    if (!ctx) {
        throw new Error("useSavedPostsContext debe usarse dentro de SavedPostsProvider")
    }
    return ctx
}
