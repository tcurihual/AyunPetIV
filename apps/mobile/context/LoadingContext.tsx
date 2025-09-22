import React, { createContext, useState, useContext, ReactNode, useRef } from "react"
import Loading from "@ui/Loading"

interface LoadingContextType {
    isLoading: boolean
    showLoading: () => void
    hideLoading: () => void
    withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
    const ctx = useContext(LoadingContext)
    if (!ctx) throw new Error("useLoading debe usarse dentro de un LoadingProvider")
    return ctx
}

interface LoadingProviderProps {
    children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false)

    const counterRef = useRef(0)
    const showLoading = () => {
        counterRef.current += 1
        setIsLoading(true)
    }
    const hideLoading = () => {
        counterRef.current = Math.max(0, counterRef.current - 1)
        if (counterRef.current === 0) setIsLoading(false)
    }

    const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
        showLoading()
        try {
            return await fn()
        } finally {
            hideLoading()
        }
    }

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, withLoading }}>
            {children}
            <Loading visible={isLoading} />
        </LoadingContext.Provider>
    )
}
