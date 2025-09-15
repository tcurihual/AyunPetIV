import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native"
import { useModal } from "@/context/ModalContext"

type BaseModalProps = {
    title?: string
    children: React.ReactNode
    footer?: React.ReactNode
    transparent?: boolean
}

const BaseModal: React.FC<BaseModalProps> = ({ title, children, footer, transparent = true }) => {
    const { isOpen, closeModal } = useModal()

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent={transparent}
            onRequestClose={closeModal}
        >
            <Pressable style={styles.backdrop} onPress={closeModal} />
            <View style={styles.sheet}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                <View style={styles.content}>{children}</View>
                <View style={styles.footer}>
                    {footer ?? (
                        <TouchableOpacity style={styles.btn} onPress={closeModal}>
                            <Text style={styles.btnText}>Cerrar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        gap: 12,
    },
    title: { fontSize: 18, fontWeight: "700" },
    content: { gap: 8 },
    footer: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end" },
    btn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#111827",
    },
    btnText: { color: "#fff", fontWeight: "600" },
})

export default BaseModal
