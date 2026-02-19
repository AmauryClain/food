// app/_lib/meals.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OFFProduct } from "./open-food-facts";

export type Food = {
  id: string;         
  name: string;
  brand: string;
  image_url: string;
  nutriscore: string; 
  calories: number;   
  proteins: number;    
  carbs: number;       
  fats: number;        
};

export type Meal = {
  id: string;    
  name: string;   
  date: string; 
  
  foods: Food[];
};

const STORAGE_KEY = "meals.v1";

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function foodFromOFF(p: OFFProduct): Food {
  const n = p.nutriments ?? {};

  return {
    id: p.code,
    name: p.name || "Produit sans nom",
    brand: p.brands ?? "",
    image_url: p.image ?? "",
    nutriscore: (p.nutriscore ?? "").toString(),
    calories: toNum(n["energy-kcal_100g"]),
    proteins: toNum(n["proteins_100g"]),
    carbs: toNum(n["carbohydrates_100g"]),
    fats: toNum(n["fat_100g"]),
  };
}

export function mealTotalCalories(meal: Meal): number {
  return meal.foods.reduce((acc, f) => acc + (f.calories || 0), 0);
}

export async function getMeals(): Promise<Meal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Meal[]) : [];
  } catch {
    return [];
  }
}

export async function saveMeals(meals: Meal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

export async function addMeal(meal: Omit<Meal, "id"> & { id?: string }): Promise<Meal> {
  const meals = await getMeals();
  const created: Meal = {
    id: meal.id ?? String(Date.now()),
    name: meal.name,
    date: meal.date,
    foods: meal.foods ?? [],
  };
  await saveMeals([created, ...meals]);
  return created;
}

export async function updateMeal(updated: Meal): Promise<void> {
  const meals = await getMeals();
  const next = meals.map((m) => (m.id === updated.id ? updated : m));
  await saveMeals(next);
}

export async function deleteMeal(mealId: string): Promise<void> {
  const meals = await getMeals();
  await saveMeals(meals.filter((m) => m.id !== mealId));
}

export async function addFoodToMeal(mealId: string, food: Food): Promise<void> {
  const meals = await getMeals();
  const next = meals.map((m) => {
    if (m.id !== mealId) return m;
    const exists = m.foods.some((f) => f.id === food.id);
    return exists ? m : { ...m, foods: [food, ...m.foods] };
  });
  await saveMeals(next);
}

export async function removeFoodFromMeal(mealId: string, foodId: string): Promise<void> {
  const meals = await getMeals();
  const next = meals.map((m) => {
    if (m.id !== mealId) return m;
    return { ...m, foods: m.foods.filter((f) => f.id !== foodId) };
  });
  await saveMeals(next);
}
