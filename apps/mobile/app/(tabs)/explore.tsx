import { StyleSheet, Image, Platform } from "react-native";
import { Collapsible } from "@components/Collapsible";
import { ExternalLink } from "@components/ExternalLink";
import ParallaxScrollView from "@components/ParallaxScrollView";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";

export default function ExploreTab() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      <ThemedText>
        Esta pestaña es un ejemplo de cómo armar contenido en un tab.
      </ThemedText>

      <Collapsible title="Aprende más">
        <ThemedText>
          Aquí puedes enlazar documentación, mostrar tips, o incluso listar
          mascotas en adopción más adelante.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Ver docs de Expo Router</ThemedText>
        </ExternalLink>
      </Collapsible>


      {Platform.OS === "ios" && (
        <ThemedText>Este bloque sólo se ve en iOS</ThemedText>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
