import { useAuth } from "@/lib/ctx";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  Redirect,
  Stack,
  useNavigation,
  useRouter,
  useSegments,
} from "expo-router";
import { Button, Text, View } from "react-native";

export default function AppLayout() {
  const router = useRouter();
  const segment = useSegments();
  const showDrawerButton = segment[segment.length - 1] === "home";
  const nav = useNavigation<DrawerNavigationProp<{}>>();
  const { user, session, loading } = useAuth();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/" />;
  }

  return (
    <View className="bg-white h-full w-full absolute bottom-0">
      <Stack
        screenOptions={{
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
          headerLeft: ({ label }) => {
            if (showDrawerButton) {
              return (
                <Button onPress={() => nav.openDrawer()} title={"icon menu"} />
              );
            }
            if (router.canGoBack()) {
              return (
                <Button onPress={() => router.back()} title={label ?? "back"} />
              );
            }
            return null; // No button if there's nothing to go back to
          },
        }}
      >
        <Stack.Screen
          name="home"
          options={{
            title: "Home",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="discover"
          options={{
            title: "Discover",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="s/[sub]"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="s/[sub]/create"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="s/[sub]/p/[pub]"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="s/[sub]/p/[pub]/c/[comm]"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </View>
  );
}
