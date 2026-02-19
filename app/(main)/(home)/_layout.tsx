import { Stack } from "expo-router";
import { COLORS } from "../../_lib/theme";

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: COLORS.card },
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mes repas" }} />
      <Stack.Screen name="[id]" options={{ title: "Détail du repas" }} />
    </Stack>
  );
}
