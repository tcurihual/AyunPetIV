import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { setPrefsDone } from "@/utils/storage"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")
const YELLOW = "#FFD24C"
const PURPLE = "#A47CF3"

type PetType = "dog" | "cat" | "both"
type GenderPref = "any" | "male" | "female"
type AgePref = "any" | "puppy" | "young" | "adult" | "senior"
type SizePref = "any" | "small" | "medium" | "large"
type DistancePref = "any" | "5" | "10" | "25"

export default function IntermediateView() {
    const router = useRouter()

    const [petType, setPetType] = useState<PetType>("both")
    const [gender, setGender] = useState<GenderPref>("any")
    const [age, setAge] = useState<AgePref>("any")
    const [size, setSize] = useState<SizePref>("any")
    const [distance, setDistance] = useState<DistancePref>("any")
    const [kidsOk, setKidsOk] = useState<boolean | null>(null)
    const [otherPetsOk, setOtherPetsOk] = useState<boolean | null>(null)

    const saveAndContinue = async () => {
        const prefs = { petType, gender, age, size, distance, kidsOk, otherPetsOk }
        await AsyncStorage.setItem("prefs_data", JSON.stringify(prefs))
        await setPrefsDone()
        Alert.alert("Preferencias guardadas", "Te mostraremos mascotas acordes a tus gustos.")
        router.replace("/(home)")
    }

    const skip = async () => {
        await setPrefsDone()
        router.replace("/(home)")
    }

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Configura tus preferencias</Text>
                <Text style={styles.subtitle}>
                    Así podremos recomendarte adopciones más acertadas
                </Text>

                {/* Chips tipo de mascota */}
                <Section title="¿Qué te interesa adoptar?">
                    <ChipRow>
                        <Chip
                            label="Perro"
                            icon="🐕"
                            active={petType === "dog"}
                            onPress={() => setPetType("dog")}
                        />
                        <Chip
                            label="Gato"
                            icon="🐱"
                            active={petType === "cat"}
                            onPress={() => setPetType("cat")}
                        />
                        <Chip
                            label="Ambos"
                            icon="✨"
                            active={petType === "both"}
                            onPress={() => setPetType("both")}
                        />
                    </ChipRow>
                </Section>

                {/* Género */}
                <Section title="Género">
                    <ChipRow>
                        <Chip
                            label="Cualquiera"
                            active={gender === "any"}
                            onPress={() => setGender("any")}
                        />
                        <Chip
                            label="Macho"
                            active={gender === "male"}
                            onPress={() => setGender("male")}
                        />
                        <Chip
                            label="Hembra"
                            active={gender === "female"}
                            onPress={() => setGender("female")}
                        />
                    </ChipRow>
                </Section>

                {/* Edad */}
                <Section title="Edad">
                    <ChipRow>
                        <Chip
                            label="Cualquiera"
                            active={age === "any"}
                            onPress={() => setAge("any")}
                        />
                        <Chip
                            label="Cachorro/a"
                            active={age === "puppy"}
                            onPress={() => setAge("puppy")}
                        />
                        <Chip
                            label="Joven"
                            active={age === "young"}
                            onPress={() => setAge("young")}
                        />
                        <Chip
                            label="Adulto"
                            active={age === "adult"}
                            onPress={() => setAge("adult")}
                        />
                        <Chip
                            label="Senior"
                            active={age === "senior"}
                            onPress={() => setAge("senior")}
                        />
                    </ChipRow>
                </Section>

                {/* Tamaño */}
                <Section title="Tamaño">
                    <ChipRow>
                        <Chip
                            label="Cualquiera"
                            active={size === "any"}
                            onPress={() => setSize("any")}
                        />
                        <Chip
                            label="Pequeño"
                            active={size === "small"}
                            onPress={() => setSize("small")}
                        />
                        <Chip
                            label="Mediano"
                            active={size === "medium"}
                            onPress={() => setSize("medium")}
                        />
                        <Chip
                            label="Grande"
                            active={size === "large"}
                            onPress={() => setSize("large")}
                        />
                    </ChipRow>
                </Section>

                {/* Distancia */}
                <Section title="Distancia máxima">
                    <ChipRow>
                        <Chip
                            label="Cualquiera"
                            active={distance === "any"}
                            onPress={() => setDistance("any")}
                        />
                        <Chip
                            label="5 km"
                            active={distance === "5"}
                            onPress={() => setDistance("5")}
                        />
                        <Chip
                            label="10 km"
                            active={distance === "10"}
                            onPress={() => setDistance("10")}
                        />
                        <Chip
                            label="25 km"
                            active={distance === "25"}
                            onPress={() => setDistance("25")}
                        />
                    </ChipRow>
                </Section>

                {/* Compatibilidad hogar */}
                <Section title="Compatibilidad en el hogar">
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>¿Convive con niños?</Text>
                        <ChipRow>
                            <Chip
                                label="Sí"
                                active={kidsOk === true}
                                onPress={() => setKidsOk(true)}
                            />
                            <Chip
                                label="No"
                                active={kidsOk === false}
                                onPress={() => setKidsOk(false)}
                            />
                            <Chip
                                label="Indistinto"
                                active={kidsOk === null}
                                onPress={() => setKidsOk(null)}
                            />
                        </ChipRow>

                        <View style={{ height: 10 }} />
                        <Text style={styles.cardLabel}>¿Hay otras mascotas?</Text>
                        <ChipRow>
                            <Chip
                                label="Sí"
                                active={otherPetsOk === true}
                                onPress={() => setOtherPetsOk(true)}
                            />
                            <Chip
                                label="No"
                                active={otherPetsOk === false}
                                onPress={() => setOtherPetsOk(false)}
                            />
                            <Chip
                                label="Indistinto"
                                active={otherPetsOk === null}
                                onPress={() => setOtherPetsOk(null)}
                            />
                        </ChipRow>
                    </View>
                </Section>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Barra fija inferior (acciones) */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={[styles.cta, styles.ctaSecondary]} onPress={skip}>
                    <Text style={[styles.ctaText, { color: YELLOW }]}>Saltar por ahora</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cta} onPress={saveAndContinue}>
                    <Text style={styles.ctaText}>Guardar y continuar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

/* ---------- Subcomponentes UI ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    )
}

function ChipRow({ children }: { children: React.ReactNode }) {
    return <View style={styles.chipRow}>{children}</View>
}

function Chip({
    label,
    icon,
    active,
    onPress,
}: {
    label: string
    icon?: string
    active?: boolean
    onPress?: () => void
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.85}
        >
            {icon ? <Text style={styles.chipIcon}>{icon}</Text> : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#fff" },

    header: {
        width: "100%",
        backgroundColor: YELLOW,
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        justifyContent: "space-between",
    },
    logo: { width: width * 0.3, height: 36 },
    menuBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#00000010",
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#00000015" },

    content: { padding: 16, paddingBottom: 0 },
    title: { fontSize: 18, fontWeight: "700", color: "#000" },
    subtitle: { fontSize: 13, color: "#333", marginTop: 4, marginBottom: 10 },

    section: { marginTop: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 10 },

    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    chipActive: { backgroundColor: YELLOW, borderColor: YELLOW },
    chipText: { color: "#000", fontWeight: "600" },
    chipTextActive: { color: "#fff" },
    chipIcon: { fontSize: 14 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    cardLabel: { fontSize: 14, color: "#000", fontWeight: "600", marginBottom: 6 },

    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        padding: 12,
        flexDirection: "row",
        gap: 10,
    },
    cta: {
        flex: 1,
        height: 44,
        backgroundColor: YELLOW,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    ctaSecondary: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: YELLOW,
    },
    ctaText: { color: "#fff", fontWeight: "700" },
})
