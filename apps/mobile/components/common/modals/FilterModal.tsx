import { Colors } from "@/constants/Colors"
import React, { useState } from "react"
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated"
import { useThemeColor } from "@/hooks/useThemeColor"

interface FilterModalProps {
    visible: boolean
    onClose: () => void
    onApplyFilters: (filters: FilterOptions) => void
}

export interface FilterOptions {
    type: string
    gender: string
    age: string
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApplyFilters }) => {
    const [selectedType, setSelectedType] = useState<string>("all")
    const [selectedGender, setSelectedGender] = useState<string>("all")
    const [selectedAge, setSelectedAge] = useState<string>("all")
    
    const cardColor = useThemeColor({}, "card")
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const bgColor = useThemeColor({}, "background")
    const borderColor = useThemeColor({}, "border")
    const tintColor = useThemeColor({}, "tint")

    const typeOptions = [
        { value: "all", label: "Todos", icon: "🐾" },
        { value: "dog", label: "Perro", icon: "🐕" },
        { value: "cat", label: "Gato", icon: "🐱" },
    ]

    const genderOptions = [
        { value: "all", label: "Todos" },
        { value: "male", label: "Macho" },
        { value: "female", label: "Hembra" },
    ]

    const ageOptions = [
        { value: "all", label: "Todas las edades" },
        { value: "puppy", label: "Cachorro (0-1 año)" },
        { value: "young", label: "Joven (1-3 años)" },
        { value: "adult", label: "Adulto (3-7 años)" },
        { value: "senior", label: "Senior (7+ años)" },
    ]

    const handleApplyFilters = () => {
        onApplyFilters({
            type: selectedType,
            gender: selectedGender,
            age: selectedAge,
        })
        onClose()
    }

    const handleClearFilters = () => {
        setSelectedType("all")
        setSelectedGender("all")
        setSelectedAge("all")
    }

    const renderOptionButton = (
        value: string,
        label: string,
        selectedValue: string,
        onSelect: (value: string) => void,
        icon?: string
    ) => (
        <TouchableOpacity
            key={value}
            style={[
                styles.optionButton, 
                { backgroundColor: bgColor, borderColor },
                selectedValue === value && styles.optionButtonActive
            ]}
            onPress={() => onSelect(value)}
        >
            {icon && <Text style={styles.optionIcon}>{icon}</Text>}
            <Text style={[
                styles.optionText, 
                { color: textSecondaryColor },
                selectedValue === value && styles.optionTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    )

    if (!visible) return null

    return (
        <View style={styles.overlayAbsolute}>
            {/* Fondo táctil para cerrar */}
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={[styles.modalContainer, { backgroundColor: cardColor }]}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.title, { color: textColor }]}>Filtrar Mascotas</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: bgColor }]}>
                        <Text style={[styles.closeText, { color: textSecondaryColor }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Tipo de Mascota</Text>
                        <View style={styles.optionsContainer}>
                            {typeOptions.map((option) =>
                                renderOptionButton(
                                    option.value,
                                    option.label,
                                    selectedType,
                                    setSelectedType,
                                    option.icon
                                )
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Sexo</Text>
                        <View style={styles.optionsContainer}>
                            {genderOptions.map((option) =>
                                renderOptionButton(
                                    option.value,
                                    option.label,
                                    selectedGender,
                                    setSelectedGender
                                )
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Edad</Text>
                        <View style={styles.optionsContainer}>
                            {ageOptions.map((option) =>
                                renderOptionButton(
                                    option.value,
                                    option.label,
                                    selectedAge,
                                    setSelectedAge
                                )
                            )}
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: borderColor }]}>
                    <TouchableOpacity style={[styles.clearButton, { backgroundColor: bgColor, borderColor }]} onPress={handleClearFilters}>
                        <Text style={[styles.clearButtonText, { color: textSecondaryColor }]}>Limpiar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                        <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    )
}

const { height } = Dimensions.get("window")

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.7,
        minHeight: 500,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    closeText: {
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 8,
        gap: 6,
        borderWidth: 1,
    },
    optionButtonActive: {
        backgroundColor: Colors.yellow,
        borderColor: Colors.yellow,
    },
    optionIcon: {
        fontSize: 16,
    },
    optionText: {
        fontSize: 14,
        fontWeight: "500",
    },
    optionTextActive: {
        color: "#000",
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    clearButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    applyButton: {
        flex: 2,
        backgroundColor: "#F9C80E",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    overlayAbsolute: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        zIndex: 9999,
    },
})

export default FilterModal
