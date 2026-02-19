import { useSignIn } from "@clerk/clerk-expo";
import type { EmailCodeFactor } from "@clerk/types";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS, RADIUS, SHADOW } from "../_lib/theme";

function prettyClerkError(err: any) {
  const msg =
    err?.errors?.[0]?.longMessage ||
    err?.errors?.[0]?.message ||
    err?.message ||
    "Une erreur est survenue";
  return String(msg);
}

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    setError(null);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) return;
            router.replace("/(main)");
          },
        });
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        } else {
          setError("Second facteur requis, mais email_code non disponible.");
        }
      } else {
        setError("Connexion incomplète. Vérifie tes infos.");
      }
    } catch (err) {
      setError(prettyClerkError(err));
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;

    setError(null);

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) return;
            router.replace("/(main)");
          },
        });
      } else {
        setError("Code invalide ou expiré.");
      }
    } catch (err) {
      setError(prettyClerkError(err));
    }
  }, [isLoaded, signIn, setActive, router, code]);

  if (!isLoaded) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (showEmailCode) {
    return (
      <View style={styles.screen}>
        <Brand title="NutriTrack" subtitle="Connexion" />

        <View style={styles.card}>
          <Text style={styles.helperTitle}>Vérification email</Text>
          <Text style={styles.helperText}>
            Un code a été envoyé sur ton email. Entre-le ici :
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput
            style={styles.input}
            value={code}
            placeholder="Code de vérification"
            placeholderTextColor="#9CA3AF"
            onChangeText={setCode}
            keyboardType="numeric"
          />

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={onVerifyPress}
          >
            <Text style={styles.primaryBtnText}>Vérifier</Text>
          </Pressable>

          <Pressable style={styles.ghostBtn} onPress={() => setShowEmailCode(false)}>
            <Text style={styles.ghostText}>Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Brand title="NutriTrack" subtitle="Connexion" />

      <View style={styles.card}>
        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          value={password}
          placeholder="Mot de passe"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          onChangeText={setPassword}
        />

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (!emailAddress || !password) && styles.disabled,
            pressed && styles.pressed,
          ]}
          onPress={onSignInPress}
          disabled={!emailAddress || !password}
        >
          <Text style={styles.primaryBtnText}>Se connecter</Text>
        </Pressable>

        <View style={styles.linkRow}>
          <Text style={styles.linkMuted}>Pas encore de compte ? </Text>
          <Pressable onPress={() => router.push("/sign-up")}>
            <Text style={styles.linkGreen}>S&apos;inscrire</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Brand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.brand}>
      <Text style={styles.brandTitle}>{title}</Text>
      <Text style={styles.brandSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 90,
  },
  center: { alignItems: "center", justifyContent: "center" },

  brand: { alignItems: "center", marginBottom: 18 },
  brandTitle: { fontSize: 34, fontWeight: "900", color: COLORS.primary },
  brandSubtitle: { marginTop: 6, fontWeight: "700", color: "#9CA3AF" },

  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...SHADOW,
    gap: 12,
  },

  input: {
    height: 46,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "#fff",
  },

  primaryBtn: {
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 15 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },

  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  linkMuted: { color: "#9CA3AF", fontWeight: "700" },
  linkGreen: { color: COLORS.primary, fontWeight: "900" },

  error: { color: "#B00020", fontWeight: "800", marginBottom: 2 },

  helperTitle: { fontWeight: "900", fontSize: 16, color: "#111827" },
  helperText: { color: "#6B7280", fontWeight: "600" },

  ghostBtn: { alignItems: "center", marginTop: 6 },
  ghostText: { color: COLORS.primary, fontWeight: "900" },
});
