import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { COLORS, RADIUS } from "../_lib/theme";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // route vers app/(auth)/sign-in.tsx -> chemin public = /sign-in
    router.replace("/sign-in");
  };

  return (
    <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
      <Text style={styles.text}>Se déconnecter</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.45)",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  text: { color: COLORS.danger, fontWeight: "900", fontSize: 15 },
});
