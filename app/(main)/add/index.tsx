import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";

import { searchProducts, getProductByBarcode, type OFFProduct } from "../../_lib/open-food-facts";
import { addMeal, foodFromOFF, type Food } from "../../_lib/meals";
import { COLORS, RADIUS, SHADOW } from "../../_lib/theme";

const MEAL_TYPES = ["Petit-déjeuner", "Déjeuner", "Dîner", "Snack"] as const;

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ barcode?: string }>();

  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>("Petit-déjeuner");
  const [foods, setFoods] = useState<Food[]>([]);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<OFFProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastBarcode = useRef<string | null>(null);

  const openScanner = () => router.push("/add/camera");

  const addFood = useCallback((p: OFFProduct) => {
    const f = foodFromOFF(p);
    setFoods((prev) => (prev.some((x) => x.id === f.id) ? prev : [f, ...prev]));
  }, []);

  const removeFood = (id: string) => setFoods((prev) => prev.filter((f) => f.id !== id));

  // scan -> fetch -> add
  useEffect(() => {
    const bc = params.barcode?.trim();
    if (!bc) return;
    if (lastBarcode.current === bc) return;
    lastBarcode.current = bc;

    const ac = new AbortController();
    setLoading(true);
    setError(null);

    getProductByBarcode(bc, ac.signal)
      .then((p) => {
        if (!p) return setError("Produit scanné non trouvé dans Open Food Facts.");
        addFood(p);
      })
      .catch(() => setError("Erreur pendant le scan."))
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [params.barcode, addFood]);

  // search debounce >= 400ms
  useEffect(() => {
    const query = q.trim();
    const ac = new AbortController();
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
    }, 500);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  const validate = async () => {
    if (!foods.length) return;
    setLoading(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const created = await addMeal({ name: mealType, date, foods });
      router.replace(`/(main)/(home)/${created.id}`);
    } catch {
      setError("Impossible d’enregistrer le repas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Type de repas</Text>

      <View style={styles.pills}>
        {MEAL_TYPES.map((t) => {
          const active = t === mealType;
          return (
            <Pressable
              key={t}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setMealType(t)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { marginTop: 12 }]}>Rechercher un aliment</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher un produit…"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <Pressable style={styles.scanBtn} onPress={openScanner}>
          <Ionicons name="barcode-outline" size={18} color="white" />
        </Pressable>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading && <View style={{ paddingVertical: 8 }}><ActivityIndicator /></View>}

      {/* Aliments ajoutés */}
      {foods.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 12 }]}>Aliments ajoutés ({foods.length})</Text>
          <View style={{ gap: 10 }}>
            {foods.map((f) => (
              <View key={f.id} style={styles.addedCard}>
                {!!f.image_url && <Image source={{ uri: f.image_url }} style={styles.addedImg} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.addedTitle} numberOfLines={1}>{f.name}</Text>
                  <Text style={styles.addedSub} numberOfLines={1}>
                    {f.brand || "—"} — {Math.round(f.calories)} kcal
                  </Text>
                </View>
                <Pressable style={styles.removeCircle} onPress={() => removeFood(f.id)}>
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Résultats */}
      <FlatList
        data={results}
        keyExtractor={(it) => it.code}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.resultCard} onPress={() => addFood(item)}>
            {!!item.image && <Image source={{ uri: item.image }} style={styles.resultImg} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.resultSub} numberOfLines={1}>
                {item.brands || "—"}
              </Text>
            </View>
            <View style={styles.plusCircle}>
              <Ionicons name="add" size={16} color="white" />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          q.trim().length >= 2 && !loading ? <Text style={styles.emptyRes}>Aucun résultat</Text> : null
        }
      />

      <Pressable style={[styles.validateBtn, (!foods.length || loading) && { opacity: 0.5 }]} onPress={validate} disabled={!foods.length || loading}>
        <Text style={styles.validateText}>Valider le repas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },

  label: { fontWeight: "900", color: COLORS.text, marginBottom: 8 },

  pills: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  pill: { backgroundColor: COLORS.card, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontWeight: "800", color: COLORS.text, fontSize: 12 },
  pillTextActive: { color: "white" },

  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: COLORS.card, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontWeight: "700", color: COLORS.text },

  scanBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", ...SHADOW },

  error: { color: COLORS.danger, fontWeight: "800", marginTop: 8 },

  addedCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, flexDirection: "row", gap: 12, alignItems: "center", ...SHADOW },
  addedImg: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F3F4F6" },
  addedTitle: { fontWeight: "900", color: COLORS.text },
  addedSub: { color: "#9CA3AF", fontWeight: "700", fontSize: 12, marginTop: 2 },
  removeCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.danger, alignItems: "center", justifyContent: "center" },

  resultCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, flexDirection: "row", gap: 12, alignItems: "center", marginTop: 10, ...SHADOW },
  resultImg: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F3F4F6" },
  resultTitle: { fontWeight: "900", color: COLORS.text },
  resultSub: { color: "#9CA3AF", fontWeight: "700", fontSize: 12, marginTop: 2 },
  plusCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },

  emptyRes: { color: "#9CA3AF", fontWeight: "700", textAlign: "center", marginTop: 16 },

  validateBtn: { position: "absolute", left: 16, right: 16, bottom: 92, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: "center", ...SHADOW },
  validateText: { color: "white", fontWeight: "900", fontSize: 16 },
});
