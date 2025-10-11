import { useAuthContext } from "@/context/AuthContext"
import { getPlainPassword, getUser } from "@/utils/storage"
import * as LocalAuthentication from "expo-local-authentication"
import { useAlert } from "@/context/AlertContext"
import { User } from "@/utils/types"
import { useLoading } from "@/context/LoadingContext"

export function useBiometricLogin() {
    const { signIn } = useAuthContext()
    const { showAlert } = useAlert()
    const { withLoading } = useLoading()

    const tryBiometricLogin = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync()
        const isEnrolled = await LocalAuthentication.isEnrolledAsync()

        if (!hasHardware || !isEnrolled) return

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Autenticarse para iniciar sesión",
            cancelLabel: "Usar contraseña",
        })

        if (!result.success) return

        await withLoading(async () => {
            const password = await getPlainPassword()
            const user: User | null = await getUser()
            const email = user?.email

            if (email && password) {
                try {
                    await signIn({ email, password })
                    showAlert("Inicio de sesión exitoso.", "success")
                } catch {
                    showAlert("Error al iniciar sesión automáticamente.", "error")
                }
            }
        })
    }

    return { tryBiometricLogin }
}
