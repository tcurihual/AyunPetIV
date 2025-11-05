import React from "react"
import { Pressable, View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface CheckboxProps {
    label: string
    checked: boolean
    disabled?: boolean
    onPress: () => void
}

export function Checkbox({ label, checked, disabled, onPress }: CheckboxProps) {
    return (
        <Pressable
            onPress={!disabled ? onPress : undefined}
            style={[styles.container, disabled && { opacity: 0.5 }]}
        >
            <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    box: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#007AFF", 
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    boxChecked: {
        backgroundColor: "#007AFF", 
    },
    label: {
        fontSize: 14,
        color: "#222222",
    },
})
