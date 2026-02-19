import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function MealsListScreen() {
  const meals = [
    { id: "1", title: "Petit-déj" },
    { id: "2", title: "Déjeuner" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes repas</Text>

      {meals.map((m) => (
        <Link key={m.id} href={`/(main)/(home)/${m.id}`} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{m.title}</Text>
            <Text style={styles.muted}>Voir le détail →</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: "900" },
  card: { padding: 14, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.05)" },
  cardTitle: { fontWeight: "900", fontSize: 16 },
  muted: { opacity: 0.7, marginTop: 4 },
});
