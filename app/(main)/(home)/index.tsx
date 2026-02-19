import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getMeals, mealTotalCalories, type Meal } from "../../_lib/meals";

export default function MealsListScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getMeals();
    setMeals(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openMeal = (id: string) => router.push(`/(main)/(home)/${id}`);
  const goAdd = () => router.push("/add");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mes repas</Text>
        <Pressable style={styles.addBtn} onPress={goAdd}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Chargement…</Text>
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Aucun repas enregistré.</Text>
          <Pressable style={styles.primaryBtn} onPress={goAdd}>
            <Text style={styles.primaryBtnText}>Ajouter un repas</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const total = Math.round(mealTotalCalories(item));
            return (
              <Pressable style={styles.card} onPress={() => openMeal(item.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.muted}>{item.date}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.kcal}>{total} kcal</Text>
                  <Text style={styles.mutedSmall}>{item.foods.length} aliments</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "900" },

  addBtn: { backgroundColor: "black", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  addBtnText: { color: "white", fontWeight: "900" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },

  primaryBtn: { backgroundColor: "black", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, marginTop: 10 },
  primaryBtnText: { color: "white", fontWeight: "900" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginTop: 10,
  },
  cardTitle: { fontWeight: "900", fontSize: 16 },
  muted: { opacity: 0.7 },
  mutedSmall: { opacity: 0.6, fontSize: 12, marginTop: 2 },

  right: { alignItems: "flex-end" },
  kcal: { fontWeight: "900" },
});
