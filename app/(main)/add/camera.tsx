// app/(main)/add/camera.tsx
import React, { useMemo, useRef, useState } from "react";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useIsFocused } from "@react-navigation/native";

type Params = {
  returnTo?: string;
  mode?: "scan" | "photo";
};

type CameraRef = React.ComponentRef<typeof CameraView>;

export default function CameraScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();

  const { returnTo, mode } = useLocalSearchParams<Params>();
  const effectiveMode = (mode ?? "scan") as "scan" | "photo";

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");

  const cameraRef = useRef<CameraRef>(null);
  const [scanned, setScanned] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const canRenderCamera = useMemo(() => {
    return isFocused;
  }, [isFocused]);

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Caméra</Text>
        <Text style={styles.muted}>
          Autorise l’accès à la caméra pour scanner / prendre une photo.
        </Text>

        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnTxt}>Autoriser</Text>
        </Pressable>

        <Pressable style={styles.btnGhost} onPress={() => router.back()}>
          <Text style={styles.btnGhostTxt}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const onBarcodeScanned =
    effectiveMode === "scan"
      ? ({ data }: { data: string }) => {
          if (scanned) return;
          setScanned(true);
          if (returnTo) {
            router.replace({ pathname: returnTo as any, params: { barcode: data } });
          } else {
            router.back();
          }
        }
      : undefined;

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const pic = await cameraRef.current.takePictureAsync();
    setPhotoUri(pic.uri);
  };

  const usePhoto = () => {
    if (!photoUri) return;
    if (returnTo) {
      router.replace({ pathname: returnTo as any, params: { photoUri } });
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {canRenderCamera && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={onBarcodeScanned}
        />
      )}

      <View style={styles.bar}>
        <Pressable
          style={styles.smallBtn}
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
        >
          <Text style={styles.smallTxt}>↺</Text>
        </Pressable>

        <Pressable style={styles.bigBtn} onPress={takePhoto}>
          <Text style={styles.bigTxt}>●</Text>
        </Pressable>

        <Pressable style={styles.smallBtn} onPress={() => router.back()}>
          <Text style={styles.smallTxt}>✕</Text>
        </Pressable>
      </View>
      {photoUri && (
        <View style={styles.preview}>
          <Image source={{ uri: photoUri }} style={styles.previewImg} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable style={styles.btn} onPress={usePhoto}>
              <Text style={styles.btnTxt}>Utiliser</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={() => setPhotoUri(null)}>
              <Text style={styles.btnGhostTxt}>Reprendre</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  title: { color: "white", fontSize: 26, fontWeight: "900" },
  muted: { color: "rgba(255,255,255,0.75)", textAlign: "center" },

  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bigBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  bigTxt: { fontSize: 40, color: "black", marginTop: -4 },
  smallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  smallTxt: { color: "white", fontSize: 18, fontWeight: "900" },

  btn: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  btnTxt: { color: "black", fontWeight: "900" },
  btnGhost: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  btnGhostTxt: { color: "white", fontWeight: "900" },

  preview: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 60,
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  previewImg: { width: "100%", height: 240, borderRadius: 12 },
});
