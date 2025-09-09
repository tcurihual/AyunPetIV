import { useState } from "react";
import { View, Text, Pressable } from "react-native";

type Props = { title: string; children?: React.ReactNode };

export function Collapsible({ title, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginVertical: 12 }}>
      <Pressable onPress={() => setOpen((v) => !v)}>
        <Text style={{ fontWeight: "600", fontSize: 16 }}>
          {open ? "▾" : "▸"} {title}
        </Text>
      </Pressable>
      {open && <View style={{ paddingTop: 8 }}>{children}</View>}
    </View>
  );
}
