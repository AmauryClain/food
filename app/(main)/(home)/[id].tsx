import React, { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMeals,
  mealTotalCalories,
  removeFoodFromMeal,
  deleteMeal,
  type Meal,
} from "../../_lib/meals";

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);

  const load = useCallback(async () => {
    const meals = await getMeals();
    const found = meals.find((m) => m.id === id) ?? null;
    setMeal(found);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!meal) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Repas introuvable</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>← Retour</Text>
        </Pressable>
      </View>
    );
  }

  const total = Math.round(mealTotalCalories(meal));

  const onRemoveFood = async (foodId: string) => {
    await removeFoodFromMeal(meal.id, foodId);
    await load();
  };

  const onDeleteMeal = async () => {
    await deleteMeal(meal.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>← Retour</Text>
      </Pressable>

      <Text style={styles.title}>{meal.name}</Text>
      <Text style={styles.muted}>{meal.date}</Text>
      <Text style={styles.kcal}>{total} kcal</Text>

      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => router.push("/add")}>
          <Text style={styles.btnText}>Ajouter un aliment</Text>
        </Pressable>
        <Pressable style={styles.btnDanger} onPress={onDeleteMeal}>
          <Text style={styles.btnText}>Supprimer le repas</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Aliments</Text>

      <FlatList
        data={meal.foods}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.muted}>Aucun aliment dans ce repas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.foodRow}>
            {!!item.image_url && <Image source={{ uri: item.image_url }} style={styles.img} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.foodTitle} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.mutedSmall}>{item.brand || "—"} • Nutri {item.nutriscore?.toUpperCase() || "—"}</Text>
              <Text style={styles.mutedSmall}>{Math.round(item.calories)} kcal / 100g</Text>
            </View>
            <Pressable style={styles.xBtn} onPress={() => onRemoveFood(item.id)}>
              <Text style={styles.xTxt}>✕</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 10 },
  title: { fontSize: 26, fontWeight: "900" },
  link: { fontWeight: "900" },
  muted: { opacity: 0.7 },
  kcal: { fontWeight: "900", marginTop: 4 },

  section: { marginTop: 10, fontWeight: "900" },

  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  btn: { flex: 1, backgroundColor: "black", paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  btnDanger: { flex: 1, backgroundColor: "#b00020", paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900" },

  foodRow: {
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
  mutedSmall: { opacity: 0.65, fontSize: 12 },

  xBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  xTxt: { fontWeight: "900" },
});
