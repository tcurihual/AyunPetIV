import React, { createContext, useContext, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { getUser } from "@/utils/storage"
import { Report } from "@/utils/types"
import type { User } from "./AuthContext"

interface CreateReportPayload {
    postid?: number
    messageid?: number
    description: string
}

interface ReportContextType {
    loading: boolean
    error: string | null
    createReport: (data: CreateReportPayload) => Promise<Report>
}

const ReportContext = createContext<ReportContextType | null>(null)

export const ReportProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuthContext()

    /**
     * POST: Crear un nuevo reporte
     * Permite a cualquier usuario autenticado reportar una publicación o mensaje
     * 
     * NOTA: El GET de reportes (listar todos) es solo para administradores,
     * por lo que NO se debe llamar automáticamente en el contexto.
     * Los reportes se gestionan desde el panel de administración.
     */
    async function createReport(data: CreateReportPayload): Promise<Report> {
        // Intentar obtener usuario del contexto, si no está disponible, del storage
        let currentUser = user
        
        if (!currentUser || !currentUser.id) {
            currentUser = await getUser<User>()
        }
        
        if (!currentUser || !currentUser.id) {
            const errorMsg = "Debes iniciar sesión para reportar"
            setError(errorMsg)
            throw new Error(errorMsg)
        }

        // Validar que tenga postid o messageid, pero no ambos
        if (!data.postid && !data.messageid) {
            throw new Error("Se requiere postid o messageid para crear un reporte")
        }

        if (data.postid && data.messageid) {
            throw new Error("No se puede reportar una publicación y un mensaje al mismo tiempo")
        }

        setLoading(true)
        setError(null)

        try {
            const response = await http.post<{
                message: string
                type: string
                data: Report
            }>("/v1/adoptions/reports", {
                userId: Number(currentUser.id),
                postId: data.postid,
                messageId: data.messageid,
                description: data.description,
            })

            const newReport = response.data.data
            setError(null)
            return newReport
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || "Error al crear reporte"
            setError(errorMessage)
            console.error("Error creating report:", e)
            throw e
        } finally {
            setLoading(false)
        }
    }

    const value = useMemo(
        () => ({
            loading,
            error,
            createReport,
        }),
        [loading, error]
    )

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
}

export function useReportContext() {
    const ctx = useContext(ReportContext)
    if (!ctx) {
        throw new Error("useReportContext must be used within ReportProvider")
    }
    return ctx
}
