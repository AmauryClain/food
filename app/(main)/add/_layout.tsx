import { Stack } from "expo-router";

export default function AddStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Ajouter" }} />
      <Stack.Screen name="camera" options={{ title: "Scanner" }} />
      <Stack.Screen name="product/[code]" options={{ title: "Produit" }} />
    </Stack>
  );
}
