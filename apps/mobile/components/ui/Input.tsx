import React, { useState } from "react"
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from "react-native"
import { Controller, Control, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColor } from "@/hooks/useThemeColor"

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
    
    const textColor = useThemeColor({}, "text")
    const textSecondaryColor = useThemeColor({}, "textSecondary")
    const textMutedColor = useThemeColor({}, "textMuted")
    const cardColor = useThemeColor({}, "card")
    const borderColor = useThemeColor({}, "border")
    const tintColor = useThemeColor({}, "tint")

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
                    {!!label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
                    {!!helperText && !error && <Text style={[styles.helperText, { color: textSecondaryColor }]}>{helperText}</Text>}
                    {!!error && <Text style={styles.error}>{String(error.message || "")}</Text>}

                    <View style={[styles.inputWrapper, { borderColor: tintColor, backgroundColor: cardColor }, !!error && styles.inputWrapperError]}>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder={placeholder}
                            placeholderTextColor={textMutedColor}
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
                                    color={tintColor}
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
    label: { marginBottom: 6, fontWeight: "600", fontSize: 16 },
    helperText: {
        marginBottom: 6,
        fontSize: 12,
        fontStyle: "italic",
        lineHeight: 16,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 2,
        minHeight: 50,
    },
    inputWrapperError: { borderColor: "#dc2626" },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
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
