import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { http } from "@/services/http"
import { useAuthContext } from "./AuthContext"
import { Report } from "@/utils/types"

interface CreateReportPayload {
    postid: number
    description: string
}

interface ReportContextType {
    reports: Report[]
    loading: boolean
    error: string | null
    getReports: () => Promise<void>
    createReport: (data: CreateReportPayload) => Promise<Report>
    refreshReports: () => Promise<void>
}

const ReportContext = createContext<ReportContextType | null>(null)

export const ReportProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user, status } = useAuthContext()

    // Obtener automáticamente los reportes cuando el usuario está autenticado
    useEffect(() => {
        if (status === "authenticated" && user) {
            getReports()
        }
    }, [status, user])

    /**
     * GET: Obtener reportes del usuario autenticado
     * Lista todos los reportes creados por el usuario
     */
    async function getReports() {
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
                    reports: Report[]
                }
            }>("/v1/reports")

            if (response.data.values) {
                setReports(response.data.values.reports || [])
            }
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || "Error al obtener reportes"
            setError(errorMessage)
            console.error("Error fetching reports:", e)
        } finally {
            setLoading(false)
        }
    }

    /**
     * POST: Crear un nuevo reporte
     * Permite a cualquier usuario autenticado reportar una publicación
     */
    async function createReport(data: CreateReportPayload): Promise<Report> {
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
                    report: Report
                }
            }>("/v1/reports", {
                postid: data.postid,
                description: data.description,
            })

            const newReport = response.data.values.report

            // Actualizar el estado local con el nuevo reporte
            setReports((prev) => [newReport, ...prev])

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

    /**
     * Refrescar reportes (útil para pull-to-refresh)
     */
    async function refreshReports(): Promise<void> {
        await getReports()
    }

    const value = useMemo(
        () => ({
            reports,
            loading,
            error,
            getReports,
            createReport,
            refreshReports,
        }),
        [reports, loading, error]
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
