import { useAuth } from "@/lib/context/Auth";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  Redirect,
  Stack,
  useNavigation,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";
import { Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import HomeTabBar from "@/components/HomeTabBar";
import HeaderLeftButton from "@/components/HeaderLeftButton";
import { Platform } from "react-native";

export default function AppLayout() {
  const router = useRouter();
  const segments = useSegments();
  const showDrawerButton = segments[segments.length - 1] === "home";
  const showTabBar = ["home", "discover", "create", "profile"].includes(
    segments[segments.length - 1],
  );
  const nav = useNavigation<DrawerNavigationProp<{}>>();
  const { user, session, loading } = useAuth();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <View className="bg-white h-full w-full absolute bottom-0">
      {Platform.OS === "ios" && <HeaderLeftButton show={showDrawerButton} />}
      <Stack
        screenOptions={{
          gestureEnabled: false,
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
          headerBlurEffect: "systemThickMaterial",
          headerLeft: () => {
            if (Platform.OS !== "ios") {
              if (showDrawerButton) {
                return (
                  <Feather
                    name="menu"
                    size={24}
                    color="black"
                    onPress={() => nav.openDrawer()}
                  />
                  // <Button onPress={() => nav.openDrawer()} title={"icon menu"} />
                );
              }
              if (router.canGoBack()) {
                return (
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={24}
                    color="black"
                    onPress={() => router.back()}
                  />
                  // <Button onPress={() => router.back()} title={label ?? "back"} />
                );
              }
            } else return null;
          },
          headerBackVisible: false,
          headerTitleAlign: "center",
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
          name="create"
          options={{
            title: "Create",
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
          name="profile"
          options={{
            title: "Profile",
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
      <HomeTabBar show={showTabBar} />
    </View>
  );
}
