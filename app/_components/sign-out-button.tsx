import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <Pressable style={styles.btn} onPress={handleSignOut}>
      <Text style={styles.txt}>Se déconnecter</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: "black", paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  txt: { color: "white", fontWeight: "900" },
});
