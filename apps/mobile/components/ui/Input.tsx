import React, { useState } from "react"
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from "react-native"
import { Controller, Control, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { Ionicons } from "@expo/vector-icons"

type InputType = "text" | "email" | "password" | "number"

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    label?: string
    placeholder?: string
    helperText?: string
    type?: InputType
    rules?: RegisterOptions<T, Path<T>>
    inputProps?: TextInputProps
}

export default function Input<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    helperText,
    type = "text",
    rules,
    inputProps,
}: Props<T>) {
    const [show, setShow] = useState(false)
    const isPassword = type === "password"

    // Extraer onChangeText de inputProps si existe
    const { onChangeText: externalOnChangeText, ...restInputProps } = inputProps || {}

    const keyboardType: TextInputProps["keyboardType"] =
        type === "email" ? "email-address" : type === "number" ? "number-pad" : "default"

    const autoCapitalize: TextInputProps["autoCapitalize"] = type === "email" ? "none" : "sentences"

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {!!label && <Text style={styles.label}>{label}</Text>}
                    {!!helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
                    {!!error && <Text style={styles.error}>{String(error.message || "")}</Text>}

                    <View style={[styles.inputWrapper, !!error && styles.inputWrapperError]}>
                        <TextInput
                            style={styles.input}
                            placeholder={placeholder}
                            placeholderTextColor="#A0A0A0"
                            value={(value as string | number | undefined)?.toString() ?? ""}
                            onChangeText={(txt) => {
                                // Primero ejecutar el handler interno
                                if (type === "number") {
                                    const cleaned = txt.replace(/[^\d]/g, "")
                                    onChange(cleaned)
                                } else {
                                    onChange(txt)
                                }

                                // Luego ejecutar el handler externo si existe
                                if (externalOnChangeText) {
                                    externalOnChangeText(txt)
                                }
                            }}
                            onBlur={onBlur}
                            secureTextEntry={isPassword && !show}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            {...restInputProps}
                        />

                        {isPassword && (
                            <TouchableOpacity
                                onPress={() => setShow((s) => !s)}
                                style={styles.toggleButton}
                            >
                                <Ionicons
                                    name={show ? "eye-off-outline" : "eye-outline"}
                                    size={22}
                                    color="#7c3aed"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    container: { width: "100%", marginBottom: 18 },
    label: { marginBottom: 6, fontWeight: "600", fontSize: 16, color: "#111827" },
    helperText: {
        marginBottom: 6,
        fontSize: 12,
        color: "#6b7280",
        fontStyle: "italic",
        lineHeight: 16,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#7c3aed",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 2,
        backgroundColor: "#fff",
        minHeight: 50,
    },
    inputWrapperError: { borderColor: "#dc2626" },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        color: "#111827",
    },
    toggleButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    error: {
        marginTop: 4,
        marginBottom: 6,
        paddingBottom: 4,
        color: "#dc2626",
        fontSize: 12,
        fontWeight: "500",
    },
})
