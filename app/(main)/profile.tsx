import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import SignOutButton from "../_components/sign-out-button";
import { COLORS, RADIUS, SHADOW } from "../_lib/theme";

export default function ProfileScreen() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.email}>{email}</Text>
      </View>

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 24, gap: 14 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 18,
    alignItems: "center",
    gap: 10,
    ...SHADOW,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(60, 181, 74, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  email: { fontWeight: "800", color: COLORS.text },
});
