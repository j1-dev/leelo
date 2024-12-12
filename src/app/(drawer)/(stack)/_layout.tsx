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
import { Text, TouchableOpacity, View, Image } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import HomeTabBar from "@/components/HomeTabBar";
import HeaderLeftButton from "@/components/HeaderLeftButton";
import { Platform } from "react-native";
import { WHITE_LOGO_URL } from "@/components/Auth";
import { useEffect, useState } from "react";
import { fetchUser } from "@/lib/utils/api";

export default function AppLayout() {
  const [profilePic, setProfilePic] = useState(null);
  const router = useRouter();
  const segments = useSegments();
  const showDrawerButton = segments[segments.length - 1] === "home";
  const showTabBar =
    ["home", "discover", "create", "profile"].includes(
      segments[segments.length - 1],
    ) && segments.length <= 3; // Ejemplo: pathname -> /home segments -> [(drawer),(stack),home]
  const nav = useNavigation<DrawerNavigationProp<{}>>();
  const { user, session, loading } = useAuth();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/" />;
  }

  useEffect(() => {
    fetchUser(user.id).then((userData) => {
      setProfilePic(userData.profile_pic);
    });
  }, []);

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
          headerRight: () => {
            return (
              <TouchableOpacity onPress={() => router.push("/home")}>
                <Image
                  className="max-w-md mx-auto w-[42px] h-[42px] rounded-[25px] mt-1 mr-1 z-50"
                  src={profilePic || WHITE_LOGO_URL}
                  style={{
                    resizeMode: "cover",
                  }}
                />
              </TouchableOpacity>
            );
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
            title: "Create",
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
