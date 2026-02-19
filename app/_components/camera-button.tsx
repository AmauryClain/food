// components/CameraButton.tsx
import React from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

type CameraButtonProps = {
  label?: string;
  href?: string;     
  returnTo?: string;   
};

export default function CameraButton({
  label = "Ouvrir la caméra",
  href = "/add/camera",
  returnTo,
}: CameraButtonProps) {
  const linkHref =
    returnTo
      ? ({ pathname: href, params: { returnTo } } as const)
      : href;

  return (
    <Link href={linkHref} asChild>
      <Pressable style={styles.btn}>
        <Text style={styles.txt}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: { color: "white", fontWeight: "900" },
});
