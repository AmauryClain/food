import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../../_lib/theme";
import { getMeals, mealTotalCalories, type Meal } from "../../_lib/meals";

export default function MealsListScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

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

  const goAdd = () => router.push("/add");
  const openMeal = (id: string) => router.push(`/(main)/(home)/${id}`);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {meals.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="restaurant-outline" size={60} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Aucun repas enregistré</Text>
          <Text style={styles.emptySub}>Commencez par ajouter un repas !</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => {
            const total = Math.round(mealTotalCalories(item));
            return (
              <Pressable style={styles.card} onPress={() => openMeal(item.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>{item.date}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.kcal}>{total} kcal</Text>
                  <Text style={styles.cardSub}>{item.foods.length} aliments</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* FAB + */}
      <Pressable style={styles.fab} onPress={goAdd}>
        <Ionicons name="add" size={26} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: COLORS.bg },
  muted: { color: COLORS.muted, fontWeight: "600" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  emptyTitle: { fontWeight: "900", color: COLORS.muted, marginTop: 8 },
  emptySub: { color: "#9CA3AF", fontWeight: "600" },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    ...SHADOW,
  },
  cardTitle: { fontWeight: "900", fontSize: 16, color: COLORS.text },
  cardSub: { color: "#9CA3AF", fontWeight: "600", marginTop: 4, fontSize: 12 },
  cardRight: { alignItems: "flex-end" },
  kcal: { fontWeight: "900", color: COLORS.primary },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },
});
