// app/auth/_layout.tsx
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function AuthLayout() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor }, // forzar blanco
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
