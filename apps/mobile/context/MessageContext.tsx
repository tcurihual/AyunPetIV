import React, { createContext, useContext, useMemo, useState, useCallback } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { Message } from "@/utils/types"

interface CreateMessagePayload {
    creatorId: number
    postId: number
    description: string
}

interface UpdateMessagePayload {
    description: string
}

export interface MessageWithCreator {
    id: number
    creator_id: number
    post_id: number
    description: string
    status: string
    created_at: string
    updated_at: string
    creator: {
        id: number
        name: string
        profilePhoto: string | null
    } | null
}

interface MessageContextType {
    messages: MessageWithCreator[]
    loading: boolean
    error: string | null
    getMessagesByPostId: (postId: number) => Promise<void>
    createMessage: (data: CreateMessagePayload) => Promise<MessageWithCreator>
    updateMessage: (messageId: number, data: UpdateMessagePayload) => Promise<void>
    deleteMessage: (messageId: number) => Promise<void>
    refreshMessages: (postId: number) => Promise<void>
}

const MessageContext = createContext<MessageContextType | null>(null)

export const MessageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [messages, setMessages] = useState<MessageWithCreator[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user, status } = useAuthContext()

    /**
     * GET: Obtener mensajes por post_id
     * Obtiene todos los mensajes asociados a una publicación específica
     * Incluye información del usuario que comentó (nombre y foto)
     */
    const getMessagesByPostId = useCallback(
        async (postId: number) => {
            if (!user) {
                setError("Usuario no autenticado")
                return
            }

            setLoading(true)
            setError(null)

            try {
                const response = await http.get<{
                    type: string
                    message: string
                    data: MessageWithCreator[]
                }>(`/v1/adoptions/messages/post/${postId}`)

                if (response.data.data) {
                    setMessages(response.data.data)
                }
            } catch (e: any) {
                const errorMessage = e?.response?.data?.message || "Error al obtener mensajes"
                setError(errorMessage)
                console.error("Error fetching messages:", e)
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    /**
     * POST: Crear un nuevo mensaje/comentario en una publicación
     * Cualquier usuario autenticado puede comentar en publicaciones
     */
    async function createMessage(data: CreateMessagePayload): Promise<MessageWithCreator> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.post<{
                type: string
                message: string
                data: any
            }>("/v1/adoptions/messages", {
                creatorId: data.creatorId,
                postId: data.postId,
                description: data.description,
            })

            const newMessage = response.data.data

            // Crear objeto con información del creador desde el contexto de usuario
            const messageWithCreator: MessageWithCreator = {
                ...newMessage,
                creator: {
                    id: Number(user.id),
                    name: user.name,
                    profilePhoto: user.avatar || null,
                },
            }

            // Actualizar el estado local con el nuevo mensaje al inicio
            setMessages((prev) => [messageWithCreator, ...prev])

            return messageWithCreator
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || "Error al crear mensaje"
            setError(errorMessage)
            console.error("Error creating message:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    /**
     * PUT: Actualizar un mensaje/comentario
     * Solo el creador del mensaje puede actualizarlo
     */
    const updateMessage = useCallback(
        async (messageId: number, data: UpdateMessagePayload): Promise<void> => {
            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            setLoading(true)
            setError(null)

            try {
                await http.put<{
                    type: string
                    message: string
                    data: MessageWithCreator
                }>(`/v1/adoptions/messages/${messageId}`, {
                    description: data.description,
                })

                // Actualizar el estado local con el mensaje modificado
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === messageId
                            ? {
                                  ...msg,
                                  description: data.description,
                                  updated_at: new Date().toISOString(),
                              }
                            : msg
                    )
                )
            } catch (e: any) {
                const errorMessage = e?.response?.data?.message || "Error al actualizar mensaje"
                setError(errorMessage)
                console.error("Error updating message:", e)
                throw e
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    /**
     * DELETE: Eliminar un mensaje/comentario
     * Pueden eliminar:
     * - El creador del mensaje
     * - Administradores (role 19)
     */
    const deleteMessage = useCallback(
        async (messageId: number): Promise<void> => {
            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            setLoading(true)
            setError(null)

            try {
                await http.delete(`/v1/adoptions/messages/${messageId}`)

                // Remover el mensaje del estado local
                setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
            } catch (e: any) {
                const errorMessage = e?.response?.data?.message || "Error al eliminar mensaje"
                setError(errorMessage)
                console.error("Error deleting message:", e)
                throw e
            } finally {
                setLoading(false)
            }
        },
        [user]
    )

    /**
     * Refrescar mensajes (útil para pull-to-refresh)
     */
    const refreshMessages = useCallback(
        async (postId: number): Promise<void> => {
            await getMessagesByPostId(postId)
        },
        [getMessagesByPostId]
    )

    const value = useMemo(
        () => ({
            messages,
            loading,
            error,
            getMessagesByPostId,
            createMessage,
            updateMessage,
            deleteMessage,
            refreshMessages,
        }),
        [messages, loading, error]
    )

    return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
}

export function useMessageContext() {
    const ctx = useContext(MessageContext)
    if (!ctx) {
        throw new Error("useMessageContext must be used within MessageProvider")
    }
    return ctx
}
