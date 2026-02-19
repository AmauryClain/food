import { useUser } from "@clerk/clerk-expo";
import { StyleSheet, Text, View } from "react-native";
import SignOutButton from "../_components/sign-out-button";

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.primaryEmailAddress?.emailAddress ?? "—"}</Text>
      </View>

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: "900" },
  card: { padding: 14, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.05)" },
  label: { opacity: 0.7 },
  value: { fontWeight: "900", marginTop: 4 },
});
