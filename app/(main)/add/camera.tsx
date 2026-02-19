import React from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { setPendingBarcode } from "../../_lib/pending-scan";

export default function CameraScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = React.useState(false);

  const handleScanned = React.useCallback(
    ({ data }: { data: string }) => {
      if (locked) return;

      const code = data?.trim();
      if (!code) return;

      setLocked(true);

      // ✅ on passe le code à l'écran précédent sans recréer /add
      setPendingBarcode(code);

      // ✅ on revient sur l'écran Add EXISTANT (foods conservé)
      router.back();
    },
    [locked, router]
  );

  React.useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Scanner</Text>
        <Text style={styles.muted}>Autorise la caméra pour scanner un code-barres.</Text>

        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Autoriser</Text>
        </Pressable>

        <Pressable style={styles.btnGhost} onPress={() => router.back()}>
          <Text style={styles.btnGhostText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={locked ? undefined : handleScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Scanne un code-barres…</Text>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Text style={styles.closeText}>Fermer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: "900" },
  muted: { opacity: 0.7, textAlign: "center" },

  btn: { backgroundColor: "black", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: "white", fontWeight: "900" },

  btnGhost: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnGhostText: { fontWeight: "900" },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: "center",
    gap: 10,
  },
  overlayText: {
    color: "white",
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 10,
    borderRadius: 14,
  },
  close: { backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  closeText: { color: "white", fontWeight: "900" },
});
