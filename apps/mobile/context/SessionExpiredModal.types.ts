import { User } from "@/context/AuthContext"

export type SessionExpiredPayload = {
    type: "SESSION_EXPIRED"
    props: {
        onAccept: () => void
        visible: boolean
    }
}
