import React, { useMemo, useState } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useAuthContext } from "@/context/AuthContext"
import { LineChart, PieChart, BarChart } from "react-native-gifted-charts"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import Header from "@common/Header"
import BottomNavbar from "@common/BottomNavbar"
import DropdownMenu from "@common/DropdownMenu"

const makeSeries = (n = 28, base = 10) => {
    let v = base
    return Array.from({ length: n }, () => {
        const j = (Math.random() - 0.5) * 3
        v = Math.max(2, v + j)
        return { value: Math.round(v * 10) / 10 }
    })
}
const publicacionesPorTipo = [
    { label: "Perros", value: 28 },
    { label: "Gatos", value: 18 },
    { label: "Otros", value: 11 },
    { label: "Exóticos", value: 4 },
]
const solicitudesEstado = [
    { text: "Pendientes", value: 18 },
    { text: "Aceptadas", value: 10 },
    { text: "Rechazadas", value: 6 },
]
const KPIS = [
    { label: "Adopciones Totales", value: 124 },
    { label: "Publicaciones Disponibles", value: 57 },
    { label: "Solicitudes", value: 34 },
]
const recientes = [
    { who: "José M.", what: "perro", when: "3 horas" },
    { who: "Ana G.", what: "gato", when: "12 horas" },
    { who: "Luis R.", what: "perro", when: "1 día" },
]

export default function ShelterDashboard() {
    const router = useRouter()
    const { user } = useAuthContext()
    const [menuVisible, setMenuVisible] = useState(false)
    const [selectedBarValue, setSelectedBarValue] = useState<string | null>(null)
    const series = useMemo(() => makeSeries(24, 10), [])

    const handleTabPress = (tab: string) => {
        console.log("Tab pressed:", tab)
        if (tab === "home") return router.replace("/(shelter)/dashboard")
    }

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar style="inverted" />

            <Header onMenuPress={() => setMenuVisible(true)} />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Gráfico Principal</Text>
                    <LineChart
                        data={series}
                        areaChart
                        curved
                        isAnimated
                        animationDuration={900}
                        thickness={3}
                        startFillColor="#a78bfa"
                        endFillColor="#ede9fe"
                        startOpacity={0.9}
                        endOpacity={0.15}
                        hideRules
                    />
                </View>

                <View style={styles.kpiRow}>
                    {KPIS.map((k, i) => (
                        <View
                            key={i}
                            style={[
                                styles.kpi,
                                { backgroundColor: ["#fef9c3", "#dbeafe", "#fde68a"][i % 3] },
                            ]}
                        >
                            <Text style={styles.kpiLabel}>{k.label}</Text>
                            <Text style={styles.kpiValue}>{k.value}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Publicaciones por tipo</Text>
                    {selectedBarValue && (
                        <View style={styles.selectedValueContainer}>
                            <Text style={styles.selectedValueText}>{selectedBarValue}</Text>
                        </View>
                    )}
                    <BarChart
                        data={publicacionesPorTipo.map((d, index) => ({
                            value: d.value,
                            label: d.label,
                            frontColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"][index % 4],
                            onPress: () => setSelectedBarValue(`${d.label}: ${d.value}`),
                        }))}
                        barWidth={22}
                        isAnimated
                        noOfSections={4}
                        xAxisLabelTextStyle={{ color: "#6b7280" }}
                        yAxisTextStyle={{ color: "#6b7280" }}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Estado de solicitudes</Text>
                    <View style={styles.pieChartSection}>
                        <View style={styles.pieChartContainer}>
                            <PieChart
                                data={solicitudesEstado.map((item, index) => ({
                                    value: item.value,
                                    color: ["#FFC107", "#10B981", "#F44336"][index],
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
                            {solicitudesEstado.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View
                                        style={[
                                            styles.legendColor,
                                            {
                                                backgroundColor: ["#FFC107", "#10B981", "#F44336"][
                                                    index
                                                ],
                                            },
                                        ]}
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
                    {recientes.map((r, i) => (
                        <View
                            key={i}
                            style={[
                                styles.listItem,
                                i < recientes.length - 1 && styles.listDivider,
                            ]}
                        >
                            <View style={styles.bullet} />
                            <Text style={styles.listText}>
                                <Text style={{ fontWeight: "700" }}>{r.who}</Text> solicitó adoptar
                                un {r.what}
                            </Text>
                            <Text style={styles.time}>{r.when}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>

            <BottomNavbar activeTab="home" onTabPress={handleTabPress} />

            {menuVisible && <DropdownMenu onClose={() => setMenuVisible(false)} />}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F9C80E",
    },
    container: {
        padding: 16,
        backgroundColor: "#f6f7fb",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#111827" },

    selectedValueContainer: {
        backgroundColor: "#f3f4f6",
        padding: 8,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    selectedValueText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },

    kpiRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    kpi: { flex: 1, padding: 12, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    kpiLabel: { fontSize: 12, color: "#374151" },
    kpiValue: { fontSize: 22, fontWeight: "800", marginTop: 4, color: "#111827" },

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
        color: "#374151",
        fontWeight: "500",
    },

    listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
    listDivider: { borderBottomWidth: 1, borderColor: "#e5e7eb" },
    bullet: {
        width: 10,
        height: 10,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: "#60a5fa",
    },
    listText: { flex: 1, color: "#111827" },
    time: { color: "#6b7280", marginLeft: 8 },
})
