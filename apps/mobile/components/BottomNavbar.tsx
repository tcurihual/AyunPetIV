// apps/mobile/components/BottomNavbar.tsx
import { View, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Props = {
    onTabPress?: (tab: string) => void
    activeTab?: string
}

export default function BottomNavbar({ onTabPress, activeTab }: Props) {
    return (
        <View style={styles.container}>
            {/* Home */}
            <Pressable style={styles.tab} onPress={() => onTabPress?.("home")}>
                <Ionicons name="home" size={26} color={activeTab === "home" ? "#000" : "#555"} />
            </Pressable>

            {/* Busquedas */}
            <Pressable style={styles.tab} onPress={() => onTabPress?.("search")}>
                <Ionicons
                    name="search"
                    size={26}
                    color={activeTab === "search" ? "#000" : "#555"}
                />
            </Pressable>

            {/* Añadir */}
            <Pressable style={styles.addBtn} onPress={() => onTabPress?.("add")}>
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>

            {/* Chat */}
            <Pressable style={styles.tab} onPress={() => onTabPress?.("chat")}>
                <Ionicons
                    name="chatbubble"
                    size={26}
                    color={activeTab === "chat" ? "#000" : "#555"}
                />
            </Pressable>

            {/* Noti */}
            <Pressable style={styles.tab} onPress={() => onTabPress?.("notifications")}>
                <Ionicons
                    name="notifications"
                    size={26}
                    color={activeTab === "notifications" ? "#000" : "#555"}
                />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 70,
        backgroundColor: "#FFD54F",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: "#ddd",

        // Fijo abajo
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    addBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#9C27B0",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 3, // lo levanta sobre la barra
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
})
