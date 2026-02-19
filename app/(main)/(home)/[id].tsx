import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOW } from "../../_lib/theme";
import { deleteMeal, getMeals, type Meal, type Food } from "../../_lib/meals";

const NUTRI_COLORS: Record<string, string> = {
  a: "#22C55E",
  b: "#84CC16",
  c: "#F59E0B",
  d: "#F97316",
  e: "#EF4444",
};

function Totals(meal: Meal) {
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

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeValue, { color }]}>{value}</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

function FoodCard({ item }: { item: Food }) {
  const nutri = (item.nutriscore || "").toLowerCase();
  const nutriColor = NUTRI_COLORS[nutri] ?? "#9CA3AF";

  return (
    <View style={styles.foodCard}>
      {!!item.image_url && <Image source={{ uri: item.image_url }} style={styles.foodImg} />}
      <View style={{ flex: 1 }}>
        <View style={styles.foodTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.foodSub} numberOfLines={1}>{item.brand || "—"}</Text>
          </View>
          <View style={[styles.nutriChip, { backgroundColor: nutriColor }]}>
            <Text style={styles.nutriText}>{nutri ? nutri.toUpperCase() : "—"}</Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <Badge label="Calories" value={`${Math.round(item.calories)} kcal`} color={COLORS.kcal} />
          <Badge label="Protéines" value={`${Math.round(item.proteins * 10) / 10} g`} color={COLORS.proteins} />
          <Badge label="Glucides" value={`${Math.round(item.carbs * 10) / 10} g`} color={COLORS.carbs} />
          <Badge label="Lipides" value={`${Math.round(item.fats * 10) / 10} g`} color={COLORS.fats} />
        </View>
      </View>
    </View>
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

  const totals = useMemo(() => (meal ? Totals(meal) : null), [meal]);

  const handleDelete = async () => {
    if (!meal) return;
    await deleteMeal(meal.id);
    router.back();
  };

  if (!meal) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontWeight: "900" }}>Repas introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>{meal.name}</Text>
      <Text style={styles.sub}>{meal.date}</Text>

      <View style={styles.totalCard}>
        <Text style={styles.section}>Total nutritionnel</Text>
        <View style={styles.badgesRow}>
          <Badge label="Calories" value={`${Math.round(totals!.calories)} kcal`} color={COLORS.kcal} />
          <Badge label="Protéines" value={`${Math.round(totals!.proteins * 10) / 10} g`} color={COLORS.proteins} />
          <Badge label="Glucides" value={`${Math.round(totals!.carbs * 10) / 10} g`} color={COLORS.carbs} />
          <Badge label="Lipides" value={`${Math.round(totals!.fats * 10) / 10} g`} color={COLORS.fats} />
        </View>
      </View>

      <Text style={styles.section}>Aliments ({meal.foods.length})</Text>

      <FlatList
        data={meal.foods}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => <FoodCard item={item} />}
        ListEmptyComponent={<Text style={styles.sub}>Aucun aliment.</Text>}
      />

      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color="white" />
        <Text style={styles.deleteText}>Supprimer ce repas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },

  h1: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  sub: { color: "#9CA3AF", fontWeight: "600", marginTop: 4 },

  section: { fontWeight: "900", marginTop: 16, marginBottom: 8, color: COLORS.text },

  totalCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 14, ...SHADOW },

  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  badge: {
    width: "48%",
    minWidth: 150,
    borderWidth: 1.6,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "white",
  },
  badgeValue: { fontWeight: "900", fontSize: 13 },
  badgeLabel: { color: "#9CA3AF", fontWeight: "700", fontSize: 11, marginTop: 2 },

  foodCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, flexDirection: "row", gap: 12, marginTop: 12, ...SHADOW },
  foodImg: { width: 54, height: 54, borderRadius: 12, backgroundColor: "#F3F4F6" },
  foodTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  foodTitle: { fontWeight: "900", color: COLORS.text },
  foodSub: { color: "#9CA3AF", fontWeight: "700", fontSize: 12, marginTop: 2 },
  nutriChip: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  nutriText: { color: "white", fontWeight: "900" },

  deleteBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 92,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    ...SHADOW,
  },
  deleteText: { color: "white", fontWeight: "900" },
});
