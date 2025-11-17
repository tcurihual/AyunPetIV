import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { AdoptionRequest } from "@/utils/types"

type AdoptionRequestRecord = AdoptionRequest & {
    postImages?: string[]
    petImages?: string[]
    requester_name?: string | null
}

interface CreateAdoptionRequestPayload {
    postid: number
    message?: string
}

interface UpdateAdoptionRequestPayload {
    status?: "approved" | "rejected"
    message?: string
}

interface AdoptionRequestContextType {
    adoptionRequests: AdoptionRequestRecord[]
    loading: boolean
    error: string | null
    getAdoptionRequests: () => Promise<void>
    createAdoptionRequest: (data: CreateAdoptionRequestPayload) => Promise<AdoptionRequestRecord>
    updateAdoptionRequest: (id: number, data: UpdateAdoptionRequestPayload) => Promise<void>
    acceptAdoptionRequest: (
        id: number
    ) => Promise<{ confirmationCode?: string | null; expiresAt?: string | null; message?: string | null }>
    validateAdoptionCode: (payload: { requestId: number; code: string }) => Promise<{ status: string | null; message?: string | null }>
    deleteAdoptionRequest: (id: number) => Promise<any>
    refreshRequests: () => Promise<void>
}

const AdoptionRequestContext = createContext<AdoptionRequestContextType | null>(null)

export const AdoptionRequestProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequestRecord[]>([])
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
            
            const response = await http.get<any>("/v1/adoptions/adoption-requests")

            
            const payload = response?.data

            function extractRequests(input: any): any[] {
                if (!input) return []

                if (Array.isArray(input) && input.length > 0 && typeof input[0] === "object") {
                    return input
                }
                
                if (input.values) {
                    if (Array.isArray(input.values.requests)) return input.values.requests
                    if (Array.isArray(input.values.items)) return input.values.items
                    if (Array.isArray(input.values)) return input.values
                }

                if (Array.isArray(input.requests)) return input.requests

                if (Array.isArray(input.data)) return input.data

                if (input.data && Array.isArray(input.data.requests)) return input.data.requests
                if (input.data && Array.isArray(input.data.items)) return input.data.items

                if (input.data && typeof input.data === "object") {
                    const nested = extractRequests(input.data)
                    if (nested.length > 0) return nested
                }

                if (input.result && typeof input.result === "object") {
                    const nested = extractRequests(input.result)
                    if (nested.length > 0) return nested
                }

                for (const k of Object.keys(input)) {
                    const v = input[k]
                    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") return v
                }

                return []
            }

            let found = extractRequests(payload)

            if (found.length > 0 && found[0] && typeof found[0] === "object") {
                const first = found[0]
                if (first.adoption_request && typeof first.adoption_request === "object") {
                    found = found.map((f: any) => f.adoption_request)
                }
            }

            // Filtrar para givers (rol 21) y shelters (rol 22) - ambos pueden recibir solicitudes
            if ((user.role === 21 || user.role === 22) && user.id) {
                const numericUserId = Number(user.id)
                if (Number.isFinite(numericUserId)) {
                    found = found.filter((req: any) => {
                        const owner =
                            req.post_owner_id ??
                            req.postOwnerId ??
                            req.post_ownerid ??
                            req.post?.creator_id ??
                            req.post?.owner_id
                        return Number(owner) === numericUserId
                    })
                }
            }

            if (user.role === 20 && user.id) {
                const numericUserId = Number(user.id)
                if (Number.isFinite(numericUserId)) {
                    found = found.filter((req: any) => {
                        const requester =
                            req.requester_id ??
                            req.requesterId ??
                            req.requesterid ??
                            req.user_id ??
                            req.user?.id
                        return Number(requester) === numericUserId
                    })
                }
            }

            if (found.length === 0 && payload && typeof payload === "object" && (payload.id || payload.adoption_request)) {
                const single = payload.adoption_request ? payload.adoption_request : payload
                found = [single]
            }

            setAdoptionRequests(found)
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
    ): Promise<AdoptionRequestRecord> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.post<{
                status?: number
                message?: string
                type?: string
                data?: any
                values?: any
                adoption_request?: AdoptionRequest
            }>("/v1/adoptions/adoption-requests", {
                // El contexto y llamadas internas usan `postid` para compatibilidad,
                // pero el microservicio espera `post_id` (snake_case). Enviar ambos
                // podría ser confuso; normalizamos a `post_id` aquí.
                post_id: data.postid,
                message: data.message || "",
            })

            const payload = response.data

            let newRequest: AdoptionRequestRecord | null = null

            if (payload?.values?.adoption_request) {
                newRequest = payload.values.adoption_request as AdoptionRequestRecord
            } else if (payload?.data?.adoption_request) {
                newRequest = payload.data.adoption_request as AdoptionRequestRecord
            } else if (payload?.data && Array.isArray(payload.data) && payload.data[0]) {
                newRequest = payload.data[0] as AdoptionRequestRecord
            } else if (
                payload?.data &&
                typeof payload.data === "object" &&
                !Array.isArray(payload.data)
            ) {
                newRequest = payload.data as AdoptionRequestRecord
            } else if (payload?.adoption_request) {
                newRequest = payload.adoption_request as AdoptionRequestRecord
            }

            if (!newRequest) {
                throw new Error("Respuesta del servidor inválida al crear la solicitud")
            }

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

        const wantsStatus = typeof data.status !== "undefined"
        const wantsMessage = typeof data.message !== "undefined"

        if (!wantsStatus && !wantsMessage) {
            throw new Error("No hay cambios para actualizar")
        }

        // Solo los dadores y shelters pueden actualizar el estado de una solicitud
        if (wantsStatus && user.role !== 21 && user.role !== 22) {
            throw new Error("Solo los dadores de adopción pueden actualizar el estado")
        }

        setLoading(true)
        setError(null)

        try {
            await http.put<{
                status: number
                message: string
                type: string
                values: {
                    adoption_request: AdoptionRequest
                }
            }>(`/v1/adoptions/adoption-requests/${id}`, {
                ...(wantsStatus ? { status: data.status } : {}),
                ...(wantsMessage ? { message: data.message } : {}),
            })

            // Actualizar el estado local
            setAdoptionRequests((prev) =>
                prev.map((req) =>
                    req.id === id
                        ? {
                              ...req,
                              ...(wantsStatus ? { status: data.status } : {}),
                              ...(wantsMessage ? { message: data.message } : {}),
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

    async function acceptAdoptionRequest(
        id: number
    ): Promise<{
        confirmationCode?: string | null
        expiresAt?: string | null
        message?: string | null
    }> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }
        if (user.role !== 21 && user.role !== 22) {
            throw new Error("Solo los dadores y shelters pueden aceptar solicitudes")
        }

        setLoading(true)
        setError(null)

        try {
            const resp = await http.post(`/v1/adoptions/adoption-requests/${id}/confirm-accept`)

            const confirmationCode =
                resp?.data?.values?.confirmationCode || resp?.data?.confirmationCode || null
            const expiresAt = resp?.data?.values?.expiresAt || resp?.data?.expiresAt || null
            const message = resp?.data?.values?.message || resp?.data?.message || null

            setAdoptionRequests((prev) =>
                prev.map((req) =>
                    req.id === id
                        ? {
                              ...req,
                              status: "approved",
                          }
                        : req
                )
            )

            return { confirmationCode, expiresAt, message }
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.message || "Error al aceptar solicitud de adopción"
            setError(errorMessage)
            console.error("Error accepting adoption request:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function validateAdoptionCode({
        requestId,
        code,
    }: {
        requestId: number
        code: string
    }): Promise<{ status: string | null; message?: string | null }> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            const resp = await http.post(`/v1/adoptions/adoption-requests/validate-code`, {
                requestId,
                code,
            })

            const status = resp?.data?.values?.status || resp?.data?.status || null
            const message = resp?.data?.values?.message || resp?.data?.message || null

            if (status) {
                setAdoptionRequests((prev) =>
                    prev.map((req) =>
                        req.id === requestId
                            ? {
                                  ...req,
                                  status,
                              }
                            : req
                    )
                )
            }

            return { status, message }
        } catch (e: any) {
            const errorMessage =
                e?.response?.data?.message || "Error al validar código de adopción"
            setError(errorMessage)
            console.error("Error validating adoption code:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    /**
     * DELETE: Eliminar una solicitud de adopción
     * Solo el dueño de la solicitud puede eliminarla
     */
    async function deleteAdoptionRequest(id: number): Promise<any> {
        if (!user) {
            throw new Error("Usuario no autenticado")
        }

        setLoading(true)
        setError(null)

        try {
            const resp = await http.delete<{
                status: number
                message: string
                type: string
            }>(`/v1/adoptions/adoption-requests/${id}`)

            // Remover del estado local
            setAdoptionRequests((prev) => prev.filter((req) => req.id !== id))

            return resp
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
            acceptAdoptionRequest,
            validateAdoptionCode,
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
