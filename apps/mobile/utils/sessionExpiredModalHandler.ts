import { useModal } from "@/context/ModalContext"

let openModalFn: (() => void) | null = null

export function registerSessionExpiredModal(fn: () => void) {
    openModalFn = fn
}

export function openSessionExpiredModal() {
    if (openModalFn) {
        openModalFn()
    }
}
