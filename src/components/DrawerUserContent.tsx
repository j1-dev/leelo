import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import {
  Feather,
  AntDesign,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { User } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { fetchUser } from "@/lib/utils/api";

export const DrawerUserContent = (props) => {
  const pathname = usePathname();

  const [userdata, setUserdata] = useState<User | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const getUser = async () => {
      fetchUser(user.id).then((res) => {
        setUserdata(res);
      });
    };

    getUser();
  }, [pathname]);

  return (
    <DrawerContentScrollView {...props}>
      <View className="flex-row px-2.5 py-5 border-b border-gray-300 mb-2.5">
        <Image
          source={{ uri: userdata?.profile_pic }}
          width={80}
          height={80}
          className="rounded-full"
        />
        <View className="mt-6 ml-2.5">
          <Text className="text-lg font-bold">{userdata?.username}</Text>
          <Text className="text-lg italic underline">{userdata?.email}</Text>
        </View>
      </View>
      <DrawerItem
        icon={({ color, size }) => (
          <Feather
            name="list"
            size={size}
            color={pathname == "/feed" ? "#fff" : "#000"}
          />
        )}
        label={"Feed"}
        labelStyle={{
          marginLeft: -20,
          fontSize: 18,
          color: pathname == "/feed" ? "#fff" : "#000",
        }}
        style={{
          backgroundColor: pathname == "/discover" ? "#333" : "#fff",
        }}
        onPress={() => {
          router.push("/discover");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <AntDesign
            name="user"
            size={size}
            color={pathname == "/profile" ? "#fff" : "#000"}
          />
        )}
        label={"Profile"}
        labelStyle={{
          marginLeft: -20,
          fontSize: 18,
          color: pathname == "/profile" ? "#fff" : "#000",
        }}
        style={{
          backgroundColor: pathname == "/profile" ? "#333" : "#fff",
        }}
        onPress={() => {
          router.push("/profile");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <MaterialIcons
            name="favorite-outline"
            size={size}
            color={pathname == "/favourites" ? "#fff" : "#000"}
          />
        )}
        label={"Favourites"}
        labelStyle={{
          marginLeft: -20,
          fontSize: 18,
          color: pathname == "/favourites" ? "#fff" : "#000",
        }}
        style={{
          backgroundColor: pathname == "/favourites" ? "#333" : "#fff",
        }}
        onPress={() => {
          router.push("/favourites");
        }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="settings-outline"
            size={size}
            color={pathname == "/settings" ? "#fff" : "#000"}
          />
        )}
        label={"Settings"}
        labelStyle={{
          marginLeft: -20,
          fontSize: 18,
          color: pathname == "/settings" ? "#fff" : "#000",
        }}
        style={{
          backgroundColor: pathname == "/settings" ? "#333" : "#fff",
        }}
        onPress={() => {
          router.push("/settings");
        }}
      />
    </DrawerContentScrollView>
  );
};
