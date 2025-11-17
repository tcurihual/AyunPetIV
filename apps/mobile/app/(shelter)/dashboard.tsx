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
    if (typeof d === "number") {
        if (d.toString().length === 10) return new Date(d * 1000)
        return new Date(d)
    }
    const parsed = Date.parse(d)
    if (!isNaN(parsed)) return new Date(parsed)
    return null
}

function timeAgoFrom(date: Date | null) {
    if (!date) return "hace un tiempo"
    const diffMs = Date.now() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `${diffSec}s`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 30) return `${diffD}d`
    const diffM = Math.floor(diffD / 30)
    if (diffM < 12) return `${diffM}m`
    const diffY = Math.floor(diffM / 12)
    return `${diffY}a`
}

export default function ShelterDashboard() {
    const router = useRouter()
    const { user } = useAuthContext()
    const [selectedBarValue, setSelectedBarValue] = useState<string | null>(null)

    const { publications = [], loading: isLoadingPubs, getPublications } = usePublicationContext()

    const {
        adoptionRequests = [],
        loading: isLoadingReqs,
        getAdoptionRequests,
    } = useAdoptionRequestContext()

    useEffect(() => {
        // Forzar reset al obtener publicaciones desde la vista de dashboard
        // para evitar duplicar resultados si el PublicationProvider ya cargó items
        getPublications(true)
        getAdoptionRequests()
    }, [])

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

            const numericUserId = Number(user.id)

            const giverPublications = (publications || []).filter((p: any) => {
                const cid = p?.creatorId ?? p?.creator_id ?? p?.ownerId ?? p?.owner_id
                return Number(cid) === numericUserId
            })

            const giverPubIds = new Set(
                giverPublications.map((p: any) => p.postId ?? p.id ?? p?.post?.id)
            )

            const giverRequests = (adoptionRequests || []).filter((r: any) => {
                const postId = r?.post?.id ?? r?.postId ?? r?.publicationId ?? r?.publication?.id
                return postId && giverPubIds.has(postId)
            })

            const publicacionesDisponibles = giverPublications.filter(
                (p: any) => (p.status ?? p.state) === "ACTIVE"
            ).length
            const totalSolicitudes = giverRequests.length
            const adopcionesTotales = giverRequests.filter(
                (r: any) => (r.status ?? r.state) === "APPROVED"
            ).length

            const kpiData = [
                { label: "Adopciones Totales", value: adopcionesTotales },
                { label: "Publicaciones Disponibles", value: publicacionesDisponibles },
                { label: "Solicitudes Totales", value: totalSolicitudes },
            ]

            const pendientes = giverRequests.filter(
                (r: any) => (r.status ?? r.state) === "PENDING"
            ).length
            const aceptadas = giverRequests.filter(
                (r: any) => (r.status ?? r.state) === "APPROVED"
            ).length
            const rechazadas = giverRequests.filter(
                (r: any) => (r.status ?? r.state) === "REJECTED"
            ).length

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

            const days = 24
            const today = new Date()
            const dayStarts: Date[] = []
            for (let i = days - 1; i >= 0; i--) {
                const dt = new Date(today)
                dt.setHours(0, 0, 0, 0)
                dt.setDate(dt.getDate() - i)
                dayStarts.push(dt)
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
                return { value: count }
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
                const requester = r.requester ?? r.user ?? r.requesterInfo ?? {}
                const who =
                    requester?.name ?? requester?.fullName ?? r.requesterName ?? r.name ?? "Anon"

                const species =
                    r.post?.pet?.species ??
                    r.post?.species ??
                    r.pet?.species ??
                    r.species ??
                    "mascota"
                const date = parseDateAny(
                    r.createdAt ?? r.created_at ?? r.created ?? r.updatedAt ?? r.updated_at
                )
                const when = timeAgoFrom(date)
                return { who, what: species, when }
            })

            return {
                kpiData,
                solicitudesData,
                publicacionesData,
                lineSeries: counts,
                recientesData,
            }
        }, [publications, adoptionRequests, user, tintColor])

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
                    hideRules
                />
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
                <View style={styles.recientesContainer}>
                    <ScrollView
                        style={styles.recientesScrollView}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {recientesData.length === 0 && (
                            <Text style={[styles.listText, { padding: 12 }]}>
                                No hay solicitudes recientes
                            </Text>
                        )}
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
                                    solicitó adoptar un {r.what}
                                </Text>
                                <Text style={styles.time}>{r.when}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
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
            height: 200,
            borderRadius: 8,
            backgroundColor:
                colors.tabIconSelected === "#ccc" ? "#f9fafb" : colors.tabIconSelected + "20",
            padding: 4,
        },
        recientesScrollView: {
            flex: 1,
            paddingHorizontal: 8,
        },
        listItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            justifyContent: "space-between",
        },
        listDivider: { borderBottomWidth: 1, borderBottomColor: "#e6e7eb", paddingBottom: 10 },
        bullet: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.tint,
            marginRight: 12,
        },
        listText: { flex: 1, color: colors.text },
        time: { marginLeft: 12, color: "#9ca3af", fontSize: 12 },
    })
    return { styles, helpers }
}
