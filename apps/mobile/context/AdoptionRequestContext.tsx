import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { AdoptionRequest } from "@/utils/types"

interface CreateAdoptionRequestPayload {
    postid: number
    message?: string
}

interface UpdateAdoptionRequestPayload {
    status: "accepted" | "rejected"
}

interface AdoptionRequestContextType {
    adoptionRequests: AdoptionRequest[]
    loading: boolean
    error: string | null
    getAdoptionRequests: () => Promise<void>
    createAdoptionRequest: (data: CreateAdoptionRequestPayload) => Promise<AdoptionRequest>
    updateAdoptionRequest: (id: number, data: UpdateAdoptionRequestPayload) => Promise<void>
    deleteAdoptionRequest: (id: number) => Promise<void>
    refreshRequests: () => Promise<void>
}

const AdoptionRequestContext = createContext<AdoptionRequestContextType | null>(null)

export const AdoptionRequestProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user, status } = useAuthContext()

    // Obtener automáticamente las solicitudes de adopción cuando el usuario está autenticado
    useEffect(() => {
        if (status === "authenticated" && user) {
            getAdoptionRequests()
        }
    }, [status, user])

    /**
     * GET: Obtener solicitudes de adopción según el rol del usuario
     * - Para usuarios normales (role 20): Obtiene sus propias solicitudes de adopción
     * - Para dadores/refugios (role 21): Obtiene solicitudes para sus mascotas/publicaciones
     */
    async function getAdoptionRequests() {
        if (!user) {
            setError("Usuario no autenticado")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.get<{
                status: number
                message: string
                type: string
                values: {
                    as: "adopter" | "giver"
                    requests: AdoptionRequest[]
                }
            }>("/v1/adoptions/mineRequests")

            if (response.data.values) {
                setAdoptionRequests(response.data.values.requests || [])
            }
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.message || "Error al obtener solicitudes de adopción"
            setError(errorMessage)
            console.error("Error fetching adoption requests:", e)
        } finally {
            setLoading(false)
        }
    }

    /**
     * POST: Crear una nueva solicitud de adopción
     * Solo los usuarios normales pueden crear solicitudes de adopción
     */
    async function createAdoptionRequest(
        data: CreateAdoptionRequestPayload
    ): Promise<AdoptionRequest> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            // Normalizar nombre de campo para el microservicio (espera `post_id`)
            const response = await http.post<{
                status: number
                message: string
                type: string
                values: {
                    adoption_request: AdoptionRequest
                }
            }>("/v1/adoptions/requests", {
                // El contexto y llamadas internas usan `postid` para compatibilidad,
                // pero el microservicio espera `post_id` (snake_case). Enviar ambos
                // podría ser confuso; normalizamos a `post_id` aquí.
                post_id: data.postid,
                message: data.message || "",
            })

            const newRequest = response.data.values.adoption_request

            // Actualizar el estado local con la nueva solicitud
            setAdoptionRequests((prev) => [newRequest, ...prev])

            return newRequest
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.message || "Error al crear solicitud de adopción"
            setError(errorMessage)
            console.error("Error creating adoption request:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    /**
     * UPDATE: Actualizar el estado de una solicitud de adopción
     * Solo los dadores de adopción (role 21) pueden aceptar/rechazar solicitudes
     */
    async function updateAdoptionRequest(
        id: number,
        data: UpdateAdoptionRequestPayload
    ): Promise<void> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        // Verificar si el usuario es un dador (role 21)
        if (user.role !== 21) {
            throw new Error("Solo los dadores de adopción pueden actualizar solicitudes")
        }

        setLoading(true)
        setError(null)

        try {
            await http.patch<{
                status: number
                message: string
                type: string
                values: {
                    adoption_request: AdoptionRequest
                }
            }>(`/v1/adoptions/requests/${id}`, {
                status: data.status,
            })

            // Actualizar el estado local
            setAdoptionRequests((prev) =>
                prev.map((req) =>
                    req.id === id
                        ? {
                              ...req,
                              status: data.status,
                              updatedAt: new Date(),
                          }
                        : req
                )
            )
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.message || "Error al actualizar solicitud de adopción"
            setError(errorMessage)
            console.error("Error updating adoption request:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    /**
     * DELETE: Eliminar una solicitud de adopción
     * Solo el dueño de la solicitud puede eliminarla
     */
    async function deleteAdoptionRequest(id: number): Promise<void> {
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
            }>(`/v1/adoptions/requests/${id}`)

            // Remover del estado local
            setAdoptionRequests((prev) => prev.filter((req) => req.id !== id))
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.message || "Error al eliminar solicitud de adopción"
            setError(errorMessage)
            console.error("Error deleting adoption request:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    /**
     * Refrescar solicitudes de adopción (útil para pull-to-refresh)
     */
    async function refreshRequests(): Promise<void> {
        await getAdoptionRequests()
    }

    const value = useMemo(
        () => ({
            adoptionRequests,
            loading,
            error,
            getAdoptionRequests,
            createAdoptionRequest,
            updateAdoptionRequest,
            deleteAdoptionRequest,
            refreshRequests,
        }),
        [adoptionRequests, loading, error]
    )

    return (
        <AdoptionRequestContext.Provider value={value}>{children}</AdoptionRequestContext.Provider>
    )
}

export function useAdoptionRequestContext() {
    const ctx = useContext(AdoptionRequestContext)
    if (!ctx) {
        throw new Error("useAdoptionRequestContext must be used within AdoptionRequestProvider")
    }
    return ctx
}
