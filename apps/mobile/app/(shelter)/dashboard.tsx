import React, { useMemo, useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { LineChart, PieChart, BarChart } from "react-native-gifted-charts"
import { usePublicationContext } from "@/context/PublicationContext"
import { useAdoptionRequestContext } from "@/context/AdoptionRequestContext"
import { translateSpeciesToSpanish } from "../../utils/petTranslations"
import { useThemeColor } from "@/hooks/useThemeColor"
import { Colors } from "@/constants/Colors"

function parseDateAny(d: any): Date | null {
    if (!d) return null
    if (d instanceof Date) return d
    
    // Si es un número
    if (typeof d === "number") {
        // Timestamp en segundos (10 dígitos) - convertir a milisegundos
        if (d.toString().length === 10) return new Date(d * 1000)
        // Timestamp en milisegundos (13 dígitos)
        return new Date(d)
    }
    
    // Si es un string, intentar parsearlo
    if (typeof d === "string") {
        // Si tiene formato ISO sin timezone (ej: "2025-11-17T22:15:43.041629")
        // Asumimos que es hora local de Chile (UTC-3), no UTC
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(d) && !d.includes('Z') && !d.includes('+') && !/\d{2}:\d{2}-/.test(d)) {
            // Parsear como UTC y restar 3 horas para obtener hora local
            const utcDate = new Date(d + 'Z')
            return new Date(utcDate.getTime() - (3 * 60 * 60 * 1000))
        }
        
        // Formato ISO 8601 o timestamp de PostgreSQL con timezone
        const parsed = Date.parse(d)
        if (!isNaN(parsed)) {
            return new Date(parsed)
        }
    }
    
    return null
}

function timeAgoFrom(date: Date | null) {
    if (!date) return "hace un tiempo"
    
    const now = Date.now()
    const dateTime = date.getTime()
    const diffMs = now - dateTime
    
    // Si la fecha es futura o inválida
    if (diffMs < 0) {
        return "ahora mismo"
    }
    
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `${diffSec}s`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 30) return `${diffD}d`
    const diffM = Math.floor(diffD / 30)
    if (diffM < 12) return `${diffM}mes${diffM > 1 ? 'es' : ''}`
    const diffY = Math.floor(diffM / 12)
    return `${diffY}año${diffY > 1 ? 's' : ''}`
}

export default function ShelterDashboard() {
    const router = useRouter()
    const { user } = useAuthContext()
    const [selectedBarValue, setSelectedBarValue] = useState<string | null>(null)
    const [postsData, setPostsData] = useState<Record<number, any>>({}) // Mapa de post_id a datos del post

    const { publications = [], loading: isLoadingPubs, getPublications, getPublicationByPostId } = usePublicationContext()

    const {
        adoptionRequests = [],
        loading: isLoadingReqs,
        getAdoptionRequests,
    } = useAdoptionRequestContext()

    useEffect(() => {
        // Cargar publicaciones y solicitudes del usuario actual
        if (user && user.id) {
            // Cargar solo las publicaciones del usuario actual
            const userId = Number(user.id)
            if (Number.isFinite(userId)) {
                getPublications(true, userId)
            } else {
                getPublications(true)
            }
            getAdoptionRequests()
        }
    }, [user?.id])

    // Cargar datos de los posts para obtener nombres de mascotas
    useEffect(() => {
        async function loadPostsData() {
            if (!adoptionRequests || adoptionRequests.length === 0) return
            
            const postIds = [...new Set(adoptionRequests.map((r: any) => r.post_id).filter(Boolean))]
            if (postIds.length === 0) return
            
            try {
                const newPostsData: Record<number, any> = {}
                
                // Cargar datos de cada post usando el método del contexto
                for (const postId of postIds) {
                    try {
                        const publication = await getPublicationByPostId(postId)
                        if (publication) {
                            newPostsData[postId] = publication
                        }
                    } catch (err) {
                        console.warn(`No se pudo cargar post ${postId}`)
                    }
                }
                
                setPostsData(newPostsData)
            } catch (error) {
                console.error("Error cargando datos de posts:", error)
            }
        }
        
        loadPostsData()
    }, [adoptionRequests, getPublicationByPostId])

    const bgColor = useThemeColor({}, "background")
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const tintColor = useThemeColor({}, "tint")
    const tabIconSelectedColor = useThemeColor({}, "tabIconSelected")

    const { styles, helpers } = useMemo(
        () =>
            createStyles({
                background: bgColor,
                card: cardColor,
                text: textColor,
                tint: tintColor,
                yellow: Colors.yellow,
                purple: Colors.purple,
                tabIconSelected: tabIconSelectedColor,
            }),
        [bgColor, cardColor, textColor, tintColor, tabIconSelectedColor]
    )

    const { kpiData, solicitudesData, publicacionesData, lineSeries, recientesData } =
        useMemo(() => {
            if (!user) {
                return {
                    kpiData: [],
                    solicitudesData: [],
                    publicacionesData: [],
                    lineSeries: [],
                    recientesData: [],
                }
            }

            // Las publicaciones ya vienen filtradas por el contexto
            const giverPublications = publications || []

            const giverPubIds = new Set(
                giverPublications.map((p: any) => p.postId ?? p.id ?? p?.post?.id)
            )

            // Las solicitudes ya vienen filtradas por el contexto para rol 21 y 22
            // Filtrar también las solicitudes que puedan estar marcadas como eliminadas
            const giverRequests = (adoptionRequests || []).filter((r: any) => {
                const status = String(r.status ?? r.state ?? "").toLowerCase()
                // Excluir solicitudes eliminadas o canceladas
                return status !== "deleted" && status !== "cancelled" && status !== "cancelado" && status !== "eliminado"
            })

            // Normalizar el status a minúsculas para comparación
            const publicacionesDisponibles = giverPublications.filter((p: any) => {
                const status = String(p.status ?? p.state ?? "").toLowerCase()
                return status === "active" || status === "activo" || status === ""
            }).length
            
            const totalSolicitudes = giverRequests.length
            
            const adopcionesTotales = giverRequests.filter((r: any) => {
                const status = String(r.status ?? r.state ?? "").toLowerCase()
                return status === "approved" || status === "aprobado" || status === "aceptado"
            }).length

            const kpiData = [
                { label: "Adopciones Totales", value: adopcionesTotales },
                { label: "Publicaciones Disponibles", value: publicacionesDisponibles },
                { label: "Solicitudes Totales", value: totalSolicitudes },
            ]

            const pendientes = giverRequests.filter((r: any) => {
                const status = String(r.status ?? r.state ?? "").toLowerCase()
                return status === "pending" || status === "pendiente"
            }).length
            
            const aceptadas = giverRequests.filter((r: any) => {
                const status = String(r.status ?? r.state ?? "").toLowerCase()
                return status === "approved" || status === "aprobado" || status === "aceptado"
            }).length
            
            const rechazadas = giverRequests.filter((r: any) => {
                const status = String(r.status ?? r.state ?? "").toLowerCase()
                return status === "rejected" || status === "rechazado"
            }).length

            const solicitudesData = [
                { text: "Pendientes", value: pendientes, color: "#FFC107" },
                { text: "Aceptadas", value: aceptadas, color: Colors.light.success },
                { text: "Rechazadas", value: rechazadas, color: Colors.danger },
            ]

            const groupedPubs = giverPublications.reduce(
                (acc: Record<string, { label: string; value: number }>, pub: any) => {
                    const speciesRaw = pub.species
                    const label = translateSpeciesToSpanish(speciesRaw || "otro")
                    if (!acc[label]) acc[label] = { label, value: 0 }
                    acc[label].value++
                    return acc
                },
                {}
            )

            const barChartColors = [Colors.purple, Colors.yellow, tintColor, Colors.secondary]
            const publicacionesData = Object.values(groupedPubs).map((d, index) => ({
                ...d,
                frontColor: barChartColors[index % barChartColors.length],
            }))

            const days = 7 // Reducido a 7 días para mejor visualización
            const today = new Date()
            const dayStarts: Date[] = []
            const dayLabels: string[] = []
            
            for (let i = days - 1; i >= 0; i--) {
                const dt = new Date(today)
                dt.setHours(0, 0, 0, 0)
                dt.setDate(dt.getDate() - i)
                dayStarts.push(dt)
                
                // Generar etiquetas para el eje X
                const dayName = dt.toLocaleDateString('es-ES', { weekday: 'short' })
                const dayNumber = dt.getDate()
                dayLabels.push(`${dayName}\n${dayNumber}`)
            }

            const counts = dayStarts.map((start, idx) => {
                const end = new Date(start)
                end.setDate(end.getDate() + 1)
                const count = giverRequests.reduce((acc: number, r: any) => {
                    const d = parseDateAny(
                        r.createdAt ?? r.created_at ?? r.created ?? r.updatedAt ?? r.updated_at
                    )
                    if (!d) return acc
                    return d >= start && d < end ? acc + 1 : acc
                }, 0)
                
                // Asegurar que el valor nunca sea negativo
                const finalCount = Math.max(0, count)
                
                return { 
                    value: finalCount,
                    label: dayLabels[idx],
                    dataPointText: finalCount > 0 ? String(finalCount) : ''
                }
            })

            const recientesSorted = [...giverRequests]
                .sort((a: any, b: any) => {
                    const da = parseDateAny(
                        a.createdAt ?? a.created_at ?? a.created ?? a.updatedAt ?? a.updated_at
                    )
                    const db = parseDateAny(
                        b.createdAt ?? b.created_at ?? b.created ?? b.updatedAt ?? b.updated_at
                    )
                    if (!da && !db) return 0
                    if (!da) return 1
                    if (!db) return -1
                    return db.getTime() - da.getTime()
                })
                .slice(0, 6)

            const recientesData = recientesSorted.map((r: any) => {
                const requester = r.requester ?? r.user ?? r.requesterInfo ?? r.requester_info ?? {}
                const who =
                    requester?.name ?? 
                    requester?.fullName ?? 
                    requester?.full_name ??
                    r.requesterName ?? 
                    r.requester_name ??
                    r.name ?? 
                    "Usuario Anónimo"

                // Obtener datos del post desde el mapa cargado
                const postData = r.post_id ? postsData[r.post_id] : null
                
                // Obtener el nombre de la mascota
                const petName = 
                    postData?.name ??       // PublicationItem.name
                    r.post?.pet?.name ??
                    r.post?.name ??
                    r.pet?.name ??
                    r.petName ??
                    r.pet_name ??
                    null

                const species =
                    postData?.species ??    // PublicationItem.species
                    r.post?.pet?.species ??
                    r.post?.species ??
                    r.pet?.species ??
                    r.species ??
                    "mascota"
                
                // Traducir especie al español con artículo correcto
                const getSpeciesText = (spec: string) => {
                    const s = String(spec).toLowerCase()
                    if (s === "dog" || s === "perro") return "un perro"
                    if (s === "cat" || s === "gato") return "un gato"
                    if (s === "bird" || s === "ave" || s === "pájaro") return "un ave"
                    if (s === "rabbit" || s === "conejo") return "un conejo"
                    if (s === "hamster" || s === "hámster") return "un hámster"
                    return "una mascota"
                }
                
                const speciesText = getSpeciesText(species)
                    
                const date = parseDateAny(
                    r.createdAt ?? r.created_at ?? r.created ?? r.updatedAt ?? r.updated_at
                )
                
                const when = timeAgoFrom(date)
                
                return { who, petName, speciesText, when }
            })

            return {
                kpiData,
                solicitudesData,
                publicacionesData,
                lineSeries: counts,
                recientesData,
            }
        }, [publications, adoptionRequests, user, tintColor, postsData])

    const handleTabPress = (tab: string) => {
        if (tab === "home") return router.replace("/(shelter)/dashboard")
    }

    if (isLoadingPubs || isLoadingReqs || !user) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center", height: "100%" },
                ]}
            >
                <ActivityIndicator size="large" color={tintColor} />
                <Text style={{ marginTop: 10, fontSize: 16, color: helpers.text.color }}>
                    Cargando datos del dashboard...
                </Text>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Actividad (Solicitudes por día)</Text>
                <View style={styles.lineChartContainer}>
                    <LineChart
                        data={lineSeries}
                        areaChart
                        curved
                        isAnimated
                        animationDuration={900}
                        thickness={3}
                        startFillColor={helpers.tint.backgroundColor || tintColor}
                        endFillColor={styles.card.backgroundColor || cardColor}
                        startOpacity={0.9}
                        endOpacity={0.15}
                        color={tintColor}
                        width={300}
                        height={180}
                        spacing={40}
                        initialSpacing={10}
                        endSpacing={10}
                        noOfSections={4}
                        maxValue={Math.max(...lineSeries.map(d => Math.max(0, d.value)), 5)}
                        yAxisColor="#e5e7eb"
                        xAxisColor="#e5e7eb"
                        yAxisThickness={1}
                        xAxisThickness={1}
                        yAxisTextStyle={{ color: helpers.mutedText.color, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: helpers.mutedText.color, fontSize: 9, textAlign: 'center' }}
                        hideDataPoints={false}
                        dataPointsColor={tintColor}
                        dataPointsRadius={4}
                        textShiftY={-8}
                        textShiftX={-5}
                        textFontSize={10}
                        textColor={helpers.text.color}
                        hideRules={false}
                        rulesType="solid"
                        rulesColor="#f0f0f0"
                        showVerticalLines={false}
                    />
                </View>
            </View>
            <View style={styles.kpiRow}>
                {kpiData.map((k, i) => (
                    <View
                        key={i}
                        style={[
                            styles.kpi,
                            {
                                backgroundColor: [
                                    helpers.yellow.backgroundColor,
                                    helpers.tabIconSelected.backgroundColor,
                                    helpers.tint.backgroundColor,
                                ][i % 3],
                            },
                        ]}
                    >
                        <Text style={styles.kpiLabel}>{k.label}</Text>
                        <Text style={styles.kpiValue}>{k.value}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Mis Publicaciones por tipo</Text>
                {selectedBarValue && (
                    <View style={styles.selectedValueContainer}>
                        <Text style={styles.selectedValueText}>{selectedBarValue}</Text>
                    </View>
                )}
                <View style={styles.barChartContainer}>
                    <BarChart
                        data={publicacionesData.map((d) => ({
                            ...d,
                            onPress: () => setSelectedBarValue(`${d.label}: ${d.value}`),
                        }))}
                        barWidth={18}
                        isAnimated
                        noOfSections={4}
                        xAxisLabelTextStyle={{ color: helpers.mutedText.color, fontSize: 12 }}
                        yAxisTextStyle={{ color: helpers.mutedText.color }}
                        spacing={30}
                        width={300}
                        height={180}
                        xAxisThickness={1}
                        yAxisThickness={1}
                        rulesType="solid"
                        rulesColor="#e5e7eb"
                        showVerticalLines={false}
                        hideRules={false}
                        yAxisColor="#e5e7eb"
                        xAxisColor="#e5e7eb"
                    />
                </View>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Estado de mis solicitudes</Text>
                <View style={styles.pieChartSection}>
                    <View style={styles.pieChartContainer}>
                        <PieChart
                            data={solicitudesData.map((item) => ({
                                value: item.value,
                                color: item.color,
                            }))}
                            donut
                            innerRadius={50}
                            radius={80}
                            centerLabelComponent={() => null}
                            showText={false}
                            focusOnPress
                            isAnimated
                        />
                    </View>
                    <View style={styles.legendContainer}>
                        {solicitudesData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View
                                    style={[styles.legendColor, { backgroundColor: item.color }]}
                                />
                                <Text style={styles.legendText}>
                                    {item.text}: {item.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Solicitudes recientes</Text>
                {recientesData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay solicitudes recientes</Text>
                    </View>
                ) : (
                    <View style={styles.recientesContainer}>
                        <ScrollView
                            style={styles.recientesScrollView}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                        >
                            {recientesData.map((r: any, i: number) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.listItem,
                                        i < recientesData.length - 1 && styles.listDivider,
                                    ]}
                                >
                                    <View style={styles.bullet} />
                                    <Text style={styles.listText}>
                                        <Text style={{ fontWeight: "700", color: helpers.text.color }}>
                                            {r.who}
                                        </Text>
                                        {" solicitó adoptar a "}
                                        <Text style={{ fontWeight: "600", color: helpers.text.color }}>
                                            {r.petName || r.speciesText}
                                        </Text>
                                    </Text>
                                    <Text style={styles.time}>{r.when}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
            <View style={{ height: 24 }} />
        </ScrollView>
    )
}

function createStyles(colors: {
    background: string
    card: string
    text: string
    tint: string
    yellow: string
    purple: string
    tabIconSelected: string
}) {
    // 1. Mueve los helpers aquí
    const helpers = {
        text: { color: colors.text },
        mutedText: { color: "#6b7280" }, // (Este color deberías añadirlo a Colors.ts)
        tint: { backgroundColor: colors.tint },
        tabIconSelected: { backgroundColor: colors.tabIconSelected },
        yellow: { backgroundColor: colors.yellow },
        purple: { backgroundColor: colors.purple }, // Añadí el que faltaba
    }

    // 2. Deja StyleSheet.create SOLO con estilos de componentes
    const styles = StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: colors.background,
        },

        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
        },
        cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: colors.text },

        selectedValueContainer: {
            backgroundColor: "#f3f4f6", // (Este color deberías añadirlo a Colors.ts)
            padding: 8,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: "center",
        },
        selectedValueText: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
        },

        barChartContainer: {
            alignItems: "center",
            paddingHorizontal: 5,
            paddingVertical: 10,
            overflow: "hidden",
        },

        lineChartContainer: {
            alignItems: "center",
            paddingHorizontal: 5,
            paddingVertical: 15,
            paddingBottom: 20,
            overflow: "hidden",
        },

        kpiRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
        kpi: {
            flex: 1,
            padding: 12,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        kpiLabel: { fontSize: 12, color: colors.text },
        kpiValue: { fontSize: 22, fontWeight: "800", marginTop: 4, color: colors.text },

        pieChartSection: {
            alignItems: "center",
        },
        pieChartContainer: {
            alignItems: "center",
            marginBottom: 16,
        },
        legendContainer: {
            alignItems: "flex-start",
            width: "100%",
        },
        legendItem: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        legendColor: {
            width: 16,
            height: 16,
            borderRadius: 8,
            marginRight: 8,
        },
        legendText: {
            fontSize: 14,
            color: colors.text,
            fontWeight: "500",
        },
        recientesContainer: {
            minHeight: 200,
            maxHeight: 600,
            borderRadius: 8,
            backgroundColor:
                colors.tabIconSelected === "#ccc" ? "#f9fafb" : colors.tabIconSelected + "20",
            padding: 8,
        },
        emptyContainer: {
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 80,
        },
        emptyText: {
            fontSize: 14,
            color: "#9ca3af",
            textAlign: "center",
        },
        recientesScrollView: {
            flex: 1,
            paddingHorizontal: 8,
        },
        listItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            justifyContent: "space-between",
            gap: 8,
        },
        listDivider: { borderBottomWidth: 1, borderBottomColor: "#e6e7eb", paddingBottom: 12 },
        bullet: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.tint,
            marginRight: 10,
            flexShrink: 0,
        },
        listText: { 
            flex: 1, 
            color: colors.text, 
            fontSize: 14,
            lineHeight: 20,
        },
        time: { 
            marginLeft: 8, 
            color: "#9ca3af", 
            fontSize: 11,
            flexShrink: 0,
            minWidth: 50,
            textAlign: 'right',
        },
    })
    return { styles, helpers }
}
