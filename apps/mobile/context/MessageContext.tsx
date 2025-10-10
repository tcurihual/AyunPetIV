import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { Message } from "@/utils/types"

interface CreateMessagePayload {
    postid: number
    description: string
}

interface MessageContextType {
    messages: Message[]
    loading: boolean
    error: string | null
    getMessages: (postid?: number) => Promise<void>
    createMessage: (data: CreateMessagePayload) => Promise<Message>
    deleteMessage: (messageId: number) => Promise<void>
    refreshMessages: (postid?: number) => Promise<void>
}

const MessageContext = createContext<MessageContextType | null>(null)

export const MessageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user, status } = useAuthContext()

    /**
     * GET: Obtener mensajes/comentarios
     * Si se proporciona postid, obtiene los mensajes de esa publicación
     * Si no, obtiene todos los mensajes del usuario autenticado
     */
    async function getMessages(postid?: number) {
        if (!user) {
            setError("Usuario no autenticado")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const endpoint = postid ? `/v1/messages?postid=${postid}` : "/v1/messages"

            const response = await http.get<{
                status: number
                message: string
                type: string
                values: {
                    messages: Message[]
                }
            }>(endpoint)

            if (response.data.values) {
                setMessages(response.data.values.messages || [])
            }
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || "Error al obtener mensajes"
            setError(errorMessage)
            console.error("Error fetching messages:", e)
        } finally {
            setLoading(false)
        }
    }

    /**
     * POST: Crear un nuevo mensaje/comentario en una publicación
     * Cualquier usuario autenticado puede comentar en publicaciones
     */
    async function createMessage(data: CreateMessagePayload): Promise<Message> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.post<{
                status: number
                message: string
                type: string
                values: {
                    message: Message
                }
            }>("/v1/messages", {
                postid: data.postid,
                description: data.description,
            })

            const newMessage = response.data.values.message

            // Actualizar el estado local con el nuevo mensaje
            setMessages((prev) => [newMessage, ...prev])

            return newMessage
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
     * DELETE: Eliminar un mensaje/comentario (soft delete)
     * Pueden eliminar:
     * - El creador del mensaje
     * - Administradores (role 19)
     */
    async function deleteMessage(messageId: number): Promise<void> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            await http.delete<{
                status: number
                message: string
                type: string
            }>(`/v1/messages/${messageId}`)

            // Actualizar el estado local marcando el mensaje como eliminado
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? {
                              ...msg,
                              status: "deleted",
                              description: "[Mensaje eliminado por el usuario]",
                          }
                        : msg
                )
            )
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || "Error al eliminar mensaje"
            setError(errorMessage)
            console.error("Error deleting message:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    /**
     * Refrescar mensajes (útil para pull-to-refresh)
     */
    async function refreshMessages(postid?: number): Promise<void> {
        await getMessages(postid)
    }

    const value = useMemo(
        () => ({
            messages,
            loading,
            error,
            getMessages,
            createMessage,
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
