import { Stack } from "expo-router";
import { COLORS } from "../../_lib/theme";

export default function AddStackLayout() {
  return (
    <Stack
          screenOptions={{
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: COLORS.card },
            headerTitleStyle: { fontWeight: "800" },
          }}
    >
      <Stack.Screen name="index" options={{ title: "Ajouter" }} />
      <Stack.Screen name="camera" options={{ title: "Scanner" }} />
      <Stack.Screen name="product/[code]" options={{ title: "Produit" }} />
    </Stack>
  );
}
