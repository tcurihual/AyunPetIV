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

export type ModalPayload = AdoptionPayload | ReportPayload | ConfirmPayload

/** ===== Estado y contexto ===== */
type ModalState = {
    isOpen: boolean
    current: ModalPayload | null
}

type ModalContextValue = {
    isOpen: boolean
    current: ModalPayload | null
    openModal: (payload: ModalPayload) => void
    closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

/** ===== Provider ===== */
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ModalState>({ isOpen: false, current: null })

    const openModal = useCallback((payload: ModalPayload) => {
        setState({ isOpen: true, current: payload })
    }, [])

    const closeModal = useCallback(() => {
        setState({ isOpen: false, current: null })
    }, [])

    const value = useMemo<ModalContextValue>(
        () => ({
            isOpen: state.isOpen,
            current: state.current,
            openModal,
            closeModal,
        }),
        [state.isOpen, state.current, openModal, closeModal]
    )

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

/** ===== Hook ===== */
export const useModal = () => {
    const ctx = useContext(ModalContext)
    if (!ctx) throw new Error("useModal debe usarse dentro de <ModalProvider />")
    return ctx
}
