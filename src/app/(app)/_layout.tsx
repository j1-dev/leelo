import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button } from "@rneui/themed";
import { Redirect, Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "../../lib/ctx";

export default function AppLayout() {
  const { user, session, loading, signOut } = useAuth();

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
    <View className="h-full w-full absolute bottom-0">
      <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: "Discover",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="cog" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="s/[sub]"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="s/[sub]/create"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="s/[sub]/p/[pub]"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="s/[sub]/p/[pub]/c/[comm]"
          options={{
            tabBarButton: () => null,
          }}
        />
      </Tabs>
    </View>
  );
}
