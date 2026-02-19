import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { deleteMeal, getMeals, type Meal, type Food } from "../../_lib/meals";

function sum(meal: Meal) {
  return meal.foods.reduce(
    (acc, f) => {
      acc.calories += f.calories || 0;
      acc.proteins += f.proteins || 0;
      acc.carbs += f.carbs || 0;
      acc.fats += f.fats || 0;
      return acc;
    },
    { calories: 0, proteins: 0, carbs: 0, fats: 0 }
  );
}

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [meal, setMeal] = useState<Meal | null>(null);

  const load = useCallback(async () => {
    const meals = await getMeals();
    setMeal(meals.find((m) => m.id === id) ?? null);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totals = useMemo(() => (meal ? sum(meal) : null), [meal]);

  const handleDelete = async () => {
    if (!meal) return;
    await deleteMeal(meal.id);
    router.back(); // retour liste
  };

  if (!meal) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>Repas introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>← Retour</Text>
      </Pressable>

      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.muted}>{meal.date}</Text>

      {/* Totaux nutritionnels */}
      <View style={styles.totalCard}>
        <Text style={styles.section}>Total du repas</Text>
        <Row label="Calories" value={`${Math.round(totals!.calories)} kcal`} />
        <Row label="Protéines" value={`${Math.round(totals!.proteins * 10) / 10} g`} />
        <Row label="Glucides" value={`${Math.round(totals!.carbs * 10) / 10} g`} />
        <Row label="Lipides" value={`${Math.round(totals!.fats * 10) / 10} g`} />
      </View>

      {/* Bouton supprimer */}
      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Supprimer le repas</Text>
      </Pressable>

      <Text style={styles.section}>Aliments</Text>

      <FlatList
        data={meal.foods}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.muted}>Aucun aliment.</Text>}
        renderItem={({ item }) => <FoodRow item={item} />}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function FoodRow({ item }: { item: Food }) {
  return (
    <View style={styles.foodCard}>
      {!!item.image_url && <Image source={{ uri: item.image_url }} style={styles.img} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.foodTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {item.brand || "—"} • Nutri {item.nutriscore?.toUpperCase() || "—"}
        </Text>

        <View style={styles.macroRow}>
          <Text style={styles.macro}>🔥 {Math.round(item.calories)} kcal</Text>
          <Text style={styles.macro}>💪 {Math.round(item.proteins * 10) / 10}g</Text>
          <Text style={styles.macro}>🍞 {Math.round(item.carbs * 10) / 10}g</Text>
          <Text style={styles.macro}>🥑 {Math.round(item.fats * 10) / 10}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 10 },
  title: { fontSize: 26, fontWeight: "900" },
  link: { fontWeight: "900" },
  muted: { opacity: 0.7 },
  mutedSmall: { opacity: 0.65, fontSize: 12 },

  section: { fontWeight: "900", marginTop: 10 },

  totalCard: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginTop: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  value: { fontWeight: "900" },

  deleteBtn: {
    marginTop: 8,
    backgroundColor: "#b00020",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "900" },

  foodCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    marginTop: 10,
  },
  img: { width: 54, height: 54, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.08)" },
  foodTitle: { fontWeight: "900" },
  macroRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  macro: { fontSize: 12, opacity: 0.8, fontWeight: "700" },
});
