// app/_lib/theme.ts
import { Platform } from "react-native";

export const COLORS = {
  primary: "#3CB54A",
  primaryDark: "#2F9B3C",
  bg: "#F6F7F8",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",

  danger: "#EF4444",
  dangerSoft: "#FEE2E2",

  kcal: "#22C55E",
  proteins: "#3B82F6",
  carbs: "#F59E0B",
  fats: "#EF4444",
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
  default: {},
});
