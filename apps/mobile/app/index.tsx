import React from "react"
import { View, ActivityIndicator } from "react-native"

export default function Index() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    )
}
