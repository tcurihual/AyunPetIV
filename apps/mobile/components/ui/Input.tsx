import React, { useState } from "react"
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from "react-native"
import { Controller, Control, FieldValues, Path, RegisterOptions } from "react-hook-form"

type InputType = "text" | "email" | "password"

type Props<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  label?: string
  placeholder?: string
  type?: InputType
  rules?: RegisterOptions<T, Path<T>>
  inputProps?: TextInputProps
}

export default function Input<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  rules,
  inputProps,
}: Props<T>) {
  const [show, setShow] = useState(false)
  const isPassword = type === "password"

  const keyboardType: TextInputProps["keyboardType"] =
    type === "email" ? "email-address" : "default"
  const autoCapitalize: TextInputProps["autoCapitalize"] =
    type === "email" ? "none" : "sentences"

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {!!error && <Text style={styles.error}>{String(error.message || "")}</Text>}

          <View style={[styles.inputWrapper, !!error && styles.inputWrapperError]}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#A0A0A0"
              value={(value as string) ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={isPassword && !show}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              {...inputProps}
            />

            {isPassword && (
              <TouchableOpacity onPress={() => setShow((s) => !s)}>
                <Text style={styles.toggle}>{show ? "Ocultar" : "Ver"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: "600", color: "#111827" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#7c3aed",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inputWrapperError: { borderColor: "#dc2626" },
  input: { flex: 1, height: 45, fontSize: 16 },
  toggle: { paddingHorizontal: 6, color: "#7c3aed", fontWeight: "600" },
  error: { marginTop: 4, color: "#dc2626" },
})