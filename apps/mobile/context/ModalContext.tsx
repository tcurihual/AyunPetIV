import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

export type AdoptionRequestProps = {
    petId: string
    petName?: string
    onSubmit?: (payload: { petId: string; message: string }) => void | Promise<void>
}

export type ReportProps = {
    publicationId: string
    onSubmit?: (payload: {
        publicationId: string
        reason: string
        details: string
    }) => void | Promise<void>
}

export type ConfirmProps = {
    message: string
    title?: string
    onConfirm?: () => void
}

/** ===== Unión discriminada (payload) ===== */
export type AdoptionPayload = { type: "ADOPTION_REQUEST"; props: AdoptionRequestProps }
export type ReportPayload = { type: "REPORT"; props: ReportProps }
export type ConfirmPayload = { type: "CONFIRM"; props: ConfirmProps }

import { SessionExpiredPayload } from "./SessionExpiredModal.types"
import { Modal, StyleSheet } from "react-native"
import { View } from "react-native"

export type ModalPayload = AdoptionPayload | ReportPayload | ConfirmPayload | SessionExpiredPayload

/** ===== Estado y contexto ===== */
type ModalState = {
    isOpen: boolean
    content: React.ReactNode | null
}

type ModalContextValue = {
    isOpen: boolean
    content: React.ReactNode | null
    openModal: (content: React.ReactNode) => void
    closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

/** ===== Provider ===== */
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ModalState>({ isOpen: false, content: null })

    const openModal = useCallback((content: React.ReactNode) => {
        setState({ isOpen: true, content })
    }, [])

    const closeModal = useCallback(() => {
        setState({ isOpen: false, content: null })
    }, [])

    const value = useMemo(
        () => ({ ...state, openModal, closeModal }),
        [state.isOpen, state.content]
    )

    return (
        <ModalContext.Provider value={value}>
            {children}
            {/* Aquí renderizamos el contenido del modal */}
            {state.isOpen && (
                <Modal transparent animationType="fade" onRequestClose={closeModal}>
                    <View style={styles.overlay}>{state.content}</View>
                </Modal>
            )}
        </ModalContext.Provider>
    )
}

/** ===== Hook ===== */
export const useModal = () => {
    const ctx = useContext(ModalContext)
    if (!ctx) throw new Error("useModal debe usarse dentro de <ModalProvider />")
    return ctx
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
})
