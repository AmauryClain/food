import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getProductByBarcode,
  searchProducts,
  formatNum,
  type OFFProduct,
} from "../../_lib/open-food-facts";

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ barcode?: string }>();

  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<OFFProduct[]>([]);
  const [scanProduct, setScanProduct] = React.useState<OFFProduct | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [scanError, setScanError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const bc = params.barcode?.trim();
    if (!bc) return;

    const ac = new AbortController();
    setLoading(true);
    setError(null);
    setScanError(null);
    setScanProduct(null);

    getProductByBarcode(bc, ac.signal)
      .then((p) => {
        if (!p) {
          setScanError("Produit scanné non trouvé dans Open Food Facts.");
          return;
        }
        setScanProduct(p);
      })
      .catch(() => setScanError("Erreur pendant la récupération du produit scanné."))
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [params.barcode]);

  React.useEffect(() => {
    const ac = new AbortController();
    const query = q.trim();

    setError(null);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    const t = setTimeout(() => {
      searchProducts(query, ac.signal)
        .then(setResults)
        .catch(() => setError("Erreur pendant la recherche."))
        .finally(() => setLoading(false));
    }, 1200);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  const openScanner = () => {
    router.push("/add/camera");
  };

  const openDetails = (code: string) => {
    router.push(`/add/product/${code}`);
  };

  const renderItem = ({ item }: { item: OFFProduct }) => (
    <Pressable style={styles.card} onPress={() => openDetails(item.code)}>
      {!!item.image && <Image source={{ uri: item.image }} style={styles.img} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.muted} numberOfLines={1}>
          {item.brands || "—"} • Nutri {item.nutriscore?.toUpperCase() || "—"}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un aliment</Text>

      <View style={styles.row}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher par texte (ex: coca cola)"
          style={styles.input}
        />
        <Pressable style={styles.scanBtn} onPress={openScanner}>
          <Text style={styles.scanText}>Scan</Text>
        </Pressable>
      </View>

      {!!scanError && <Text style={styles.error}>{scanError}</Text>}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {loading && (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator />
        </View>
      )}

      {/* Résultat du scan (si présent) */}
      {scanProduct && (
        <Pressable style={styles.bigCard} onPress={() => openDetails(scanProduct.code)}>
          {!!scanProduct.image && <Image source={{ uri: scanProduct.image }} style={styles.bigImg} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {scanProduct.name}
            </Text>
            <Text style={styles.muted}>{scanProduct.brands || "—"}</Text>
            <Text style={styles.muted}>Nutri-score: {scanProduct.nutriscore?.toUpperCase() || "—"}</Text>
            <Text style={styles.muted}>
              kcal/100g: {formatNum(scanProduct.nutriments?.["energy-kcal_100g"])}
            </Text>
          </View>
        </Pressable>
      )}

      <FlatList
        data={results}
        keyExtractor={(it) => it.code}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          q.trim().length >= 2 && !loading ? (
            <Text style={styles.mutedCenter}>Aucun résultat.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: "900" },

  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  scanBtn: { backgroundColor: "black", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  scanText: { color: "white", fontWeight: "900" },

  error: { color: "#b00020", fontWeight: "700" },
  muted: { opacity: 0.7 },
  mutedCenter: { opacity: 0.7, textAlign: "center", marginTop: 20 },

  bigCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  bigImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.08)" },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
    marginTop: 10,
    alignItems: "center",
  },
  img: { width: 54, height: 54, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.08)" },

  cardTitle: { fontWeight: "900" },
});
