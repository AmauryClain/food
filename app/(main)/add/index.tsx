import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { searchProducts, getProductByBarcode, type OFFProduct } from "../../_lib/open-food-facts";
import { addMeal, foodFromOFF, type Food } from "../../_lib/meals";

const MEAL_TYPES = ["Petit-déjeuner", "Déjeuner", "Dîner", "Snack"] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ barcode?: string }>();

  // Step 1 : type + date
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>(MEAL_TYPES[0]);
  const [date, setDate] = useState(todayISO());

  // Step 2 : aliments du repas en cours
  const [foods, setFoods] = useState<Food[]>([]);

  // Recherche OFF
  const [q, setQ] = useState("");
  const [results, setResults] = useState<OFFProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Anti double ajout sur barcode
  const lastHandledBarcode = useRef<string | null>(null);

  const openScanner = () => router.push("/add/camera");

  const addFood = useCallback((p: OFFProduct) => {
    const f = foodFromOFF(p);
    setFoods((prev) => {
      if (prev.some((x) => x.id === f.id)) return prev; // évite doublons
      return [f, ...prev];
    });
  }, []);

  const removeFood = useCallback((foodId: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== foodId));
  }, []);

  // ---- Scan barcode => fetch produit => add au repas ----
  useEffect(() => {
    const bc = params.barcode?.trim();
    if (!bc) return;

    // évite de re-traiter le même barcode si rerender
    if (lastHandledBarcode.current === bc) return;
    lastHandledBarcode.current = bc;

    const ac = new AbortController();
    setError(null);
    setLoading(true);

    getProductByBarcode(bc, ac.signal)
      .then((p) => {
        if (!p) {
          setError("Produit scanné non trouvé dans Open Food Facts.");
          return;
        }
        addFood(p);
      })
      .catch(() => setError("Erreur pendant la récupération du produit scanné."))
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [params.barcode, addFood]);

  // ---- Recherche texte OFF (debounce >= 400ms) ----
  useEffect(() => {
    const ac = new AbortController();
    const query = q.trim();

    setError(null);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    // ✅ 400ms minimum demandé → je mets 600ms pour éviter le rate limit
    const t = setTimeout(() => {
      searchProducts(query, ac.signal)
        .then(setResults)
        .catch(() => setError("Erreur pendant la recherche."))
        .finally(() => setLoading(false));
    }, 600);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const query = q.trim();
      if (query.length >= 2) {
        const res = await searchProducts(query);
        setResults(res);
      }
    } finally {
      setRefreshing(false);
    }
  }, [q]);

  const canValidate = useMemo(() => {
    return mealType.length > 0 && date.length === 10 && foods.length > 0;
  }, [mealType, date, foods.length]);

  const validateMeal = useCallback(async () => {
    if (!canValidate) return;

    try {
      setLoading(true);
      const created = await addMeal({
        name: mealType,
        date,
        foods,
      });

      // Après validation : on va sur le détail du repas
      router.replace(`/(main)/(home)/${created.id}`);
    } catch (e) {
      setError("Impossible d’enregistrer le repas.");
    } finally {
      setLoading(false);
    }
  }, [canValidate, mealType, date, foods, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un repas</Text>

      {/* STEP 1 */}
      <Text style={styles.section}>1) Type de repas</Text>
      <View style={styles.pillsRow}>
        {MEAL_TYPES.map((t) => {
          const active = t === mealType;
          return (
            <Pressable
              key={t}
              onPress={() => setMealType(t)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Date</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
        autoCapitalize="none"
      />

      {/* STEP 2 */}
      <View style={styles.rowBetween}>
        <Text style={styles.section}>2) Ajouter des aliments</Text>
        <Pressable style={styles.scanBtn} onPress={openScanner}>
          <Text style={styles.scanText}>Scanner</Text>
        </Pressable>
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Rechercher un aliment (Open Food Facts)"
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {loading && (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator />
        </View>
      )}

      {/* Aliments ajoutés */}
      <Text style={styles.section}>Aliments du repas ({foods.length})</Text>

      {foods.length === 0 ? (
        <Text style={styles.muted}>
          Aucun aliment ajouté. Utilise la recherche ou le scan.
        </Text>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(f) => f.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
          renderItem={({ item }) => (
            <View style={styles.foodChip}>
              {!!item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.foodImg} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.foodTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.foodMeta} numberOfLines={1}>
                  {item.brand || "—"} • {Math.round(item.calories)} kcal
                </Text>
              </View>
              <Pressable style={styles.removeBtn} onPress={() => removeFood(item.id)}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Résultats recherche cliquables */}
      <Text style={styles.section}>Résultats</Text>

      <FlatList
        data={results}
        keyExtractor={(it) => it.code}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 110 }}
        ListEmptyComponent={
          q.trim().length >= 2 && !loading ? (
            <Text style={styles.muted}>Aucun résultat.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.resultCard} onPress={() => addFood(item)}>
            {!!item.image && <Image source={{ uri: item.image }} style={styles.resultImg} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.mutedSmall} numberOfLines={1}>
                {item.brands || "—"} • Nutri {item.nutriscore?.toUpperCase() || "—"}
              </Text>
            </View>
            <Text style={styles.plus}>＋</Text>
          </Pressable>
        )}
      />

      {/* Validate (fixé en bas) */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={validateMeal}
          disabled={!canValidate || loading}
          style={[styles.validateBtn, (!canValidate || loading) && styles.validateBtnDisabled]}
        >
          <Text style={styles.validateText}>Valider</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: "900", marginBottom: 10 },

  section: { fontWeight: "900", marginTop: 14, marginBottom: 8 },
  muted: { opacity: 0.7 },
  mutedSmall: { opacity: 0.65, fontSize: 12 },
  error: { color: "#b00020", fontWeight: "700", marginTop: 6 },

  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  pillActive: { backgroundColor: "black" },
  pillText: { fontWeight: "900" },
  pillTextActive: { color: "white" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scanBtn: { backgroundColor: "black", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  scanText: { color: "white", fontWeight: "900" },

  foodChip: {
    width: 260,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  foodImg: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.08)" },
  foodTitle: { fontWeight: "900" },
  foodMeta: { opacity: 0.65, fontSize: 12, marginTop: 2 },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { fontWeight: "900" },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
    marginTop: 10,
  },
  resultImg: { width: 54, height: 54, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.08)" },
  resultTitle: { fontWeight: "900" },
  plus: { fontSize: 22, fontWeight: "900", opacity: 0.7 },

  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
  },
  validateBtn: {
    backgroundColor: "black",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  validateBtnDisabled: { opacity: 0.4 },
  validateText: { color: "white", fontWeight: "900", fontSize: 16 },
});
