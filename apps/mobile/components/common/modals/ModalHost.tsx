import React from "react"
import { useModal } from "@/context/ModalContext"
import AdoptionRequestModal from "./types/AdoptionRequestModal"
import ReportModal from "./types/ReportModal"
import ConfirmModal from "./types/ConfirmModal"

const ModalHost: React.FC = () => {
    const { isOpen, current } = useModal()

    if (!isOpen || !current) return null

    switch (current.type) {
        case "ADOPTION_REQUEST":
            return <AdoptionRequestModal {...current.props} />
        case "REPORT":
            return <ReportModal {...current.props} />
        case "CONFIRM":
            return <ConfirmModal {...current.props} />
        default:
            return null
    }
}

export default ModalHost
