import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../_lib/theme";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,      
        headerTitleAlign: "center", 
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: COLORS.card },
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Mes repas",
          tabBarLabel: "Repas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Nouveau repas",
          tabBarLabel: "Ajouter",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          title: "Profil",       
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
