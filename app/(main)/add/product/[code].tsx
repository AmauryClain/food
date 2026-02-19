import React from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getProductByBarcode, formatNum, type OFFProduct } from "../../../_lib/open-food-facts";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();

  const [loading, setLoading] = React.useState(true);
  const [product, setProduct] = React.useState<OFFProduct | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    getProductByBarcode(String(code), ac.signal)
      .then((p) => {
        if (!p) {
          setError("Produit introuvable dans Open Food Facts.");
          return;
        }
        setProduct(p);
      })
      .catch(() => setError("Erreur lors de la récupération du produit."))
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [code]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: "900" }}>{error ?? "Erreur inconnue"}</Text>
        <Pressable style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const n = product.nutriments ?? {};

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={{ fontWeight: "900" }}>← Retour</Text>
      </Pressable>

      <View style={styles.header}>
        {!!product.image && <Image source={{ uri: product.image }} style={styles.img} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.muted}>{product.brands || "—"}</Text>
          <Text style={styles.muted}>Nutri-score: {product.nutriscore?.toUpperCase() || "—"}</Text>
          <Text style={styles.muted}>Code: {product.code}</Text>
        </View>
      </View>

      <Text style={styles.section}>Valeurs pour 100g</Text>

      <View style={styles.box}>
        <Row label="Calories (kcal)" value={formatNum(n["energy-kcal_100g"])} suffix="" />
        <Row label="Protéines (g)" value={formatNum(n["proteins_100g"])} suffix="" />
        <Row label="Glucides (g)" value={formatNum(n["carbohydrates_100g"])} suffix="" />
        <Row label="Lipides (g)" value={formatNum(n["fat_100g"])} suffix="" />
      </View>

      <Pressable style={styles.addBtn} onPress={() => console.log("TODO: add to meal", product.code)}>
        <Text style={styles.addBtnText}>Ajouter au repas</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },

  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  img: { width: 90, height: 90, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.06)" },
  title: { fontSize: 20, fontWeight: "900" },
  muted: { opacity: 0.7 },

  section: { fontWeight: "900", marginTop: 10 },
  box: { backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 16, padding: 12, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  value: { fontWeight: "900" },

  addBtn: { backgroundColor: "black", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 10 },
  addBtnText: { color: "white", fontWeight: "900" },

  btn: { backgroundColor: "black", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: "white", fontWeight: "900" },
});
