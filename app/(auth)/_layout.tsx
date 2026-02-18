import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(main)'} />
  }

  return (
    <Stack>
        <Stack.Screen name="sign-in"  options={{ headerShown: true, title: "Connexion" }} />
        <Stack.Screen name="sign-up" options={{ headerShown: true, title: "Inscription" }} />
    </Stack>
  );
}