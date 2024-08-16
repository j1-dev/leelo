import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button } from "@rneui/themed";
import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "../../lib/ctx";

export default function AppLayout() {
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

  // This layout can be deferred because it's not the root layout.
  return (
    <View className="bg-white h-full w-full absolute bottom-0">
      <Stack
        screenOptions={{
          headerShadowVisible: false,
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
            // animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="s/[sub]/p/[pub]/c/[comm]"
          options={
            {
              // animation: "slide_from_right",
            }
          }
        />
      </Stack>
    </View>
  );
}
