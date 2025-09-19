import * as React from "react"
import { createContext, useContext, useState, ReactNode } from "react"

type AlertType = "success" | "error" | "info" | "warning"

interface Alert {
    message: string
    type: AlertType
    visible: boolean
}

interface AlertContextProps {
    showAlert: (message: string, type?: AlertType) => void
    hideAlert: () => void
    alert: Alert
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<Alert>({
        message: "",
        type: "info",
        visible: false,
    })

    const showAlert = (message: string, type: AlertType = "info") => {
        setAlert({ message, type, visible: true })

        setTimeout(() => {
            setAlert((prev) => ({ ...prev, visible: false }))
        }, 5000) // El valor está en milisegundos 5000ms -> 5s
    }

    const hideAlert = () => {
        setAlert((prev) => ({ ...prev, visible: false }))
    }

    return (
        <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
            {children}
        </AlertContext.Provider>
    )
}

// Hook personalizado
export const useAlert = () => {
    const context = useContext(AlertContext)
    if (!context) {
        throw new Error("useAlert debe estar dentro de un AlertProvider")
    }
    return context
}
