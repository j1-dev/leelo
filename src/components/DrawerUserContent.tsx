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
  const pathname = usePathname(); // Obtiene la ruta actual

  const [userdata, setUserdata] = useState<User | null>(null);
  const { user, signOut } = useAuth(); // Obtiene el usuario autenticado y la función para cerrar sesión

  useEffect(() => {
    // Obtiene los datos del usuario al montar el componente o cuando cambia la ruta
    const getUser = async () => {
      fetchUser(user.id).then((res: any) => {
        setUserdata(res); // Establece los datos del usuario obtenidos
      });
    };
    getUser(); // Llama a la función para obtener los datos del usuario
  }, [pathname]); // Vuelve a ejecutar cuando cambia la ruta

  return (
    <View className="flex-1">
      <DrawerContentScrollView {...props}>
        <View className="flex-row px-2 py-5 border-b border-gray-300 mb-2">
          {/* Muestra la foto de perfil del usuario */}
          <Image
            source={{ uri: userdata?.profile_pic }}
            width={80}
            height={80}
            className="rounded-full"
          />
          <View className="mt-6 ml-2">
            {/* Muestra el nombre de usuario y el correo */}
            <Text className="text-lg font-bold">{userdata?.username}</Text>
            <Text className="text-lg italic underline">{userdata?.email}</Text>
          </View>
        </View>

        {/* Opción de menú para ir a la pantalla de inicio */}
        <DrawerItem
          icon={({ color, size }) => (
            <Feather
              name="home"
              size={size}
              color={pathname === "/home" ? "#fff" : "#000"}
            />
          )}
          label={"Inicio"}
          labelStyle={{
            fontSize: 18,
            color: pathname === "/home" ? "#fff" : "#000",
          }}
          style={{
            backgroundColor: pathname === "/home" ? "#333" : "#fff",
            borderRadius: 3,
            marginBottom: 5,
          }}
          onPress={() => {
            router.push("/home");
          }}
        />

        {/* Opción de menú para ir al perfil del usuario */}
        <DrawerItem
          icon={({ color, size }) => (
            <AntDesign
              name="user"
              size={size}
              color={pathname === "/profile" ? "#fff" : "#000"}
            />
          )}
          label={"Perfil"}
          labelStyle={{
            fontSize: 18,
            color: pathname === "/profile" ? "#fff" : "#000",
          }}
          style={{
            backgroundColor: pathname === "/profile" ? "#333" : "#fff",
            borderRadius: 3,
            marginBottom: 5,
          }}
          onPress={() => {
            router.push("/profile");
          }}
        />

        {/* Opción de menú para ir a los favoritos del usuario */}
        <DrawerItem
          icon={({ color, size }) => (
            <MaterialIcons
              name="favorite-outline"
              size={size}
              color={pathname === "/favourites" ? "#fff" : "#000"}
            />
          )}
          label={"Favoritos"}
          labelStyle={{
            fontSize: 18,
            color: pathname === "/favourites" ? "#fff" : "#000",
          }}
          style={{
            backgroundColor: pathname === "/favourites" ? "#333" : "#fff",
            borderRadius: 3,
          }}
          onPress={() => {
            router.push("/favourites");
          }}
        />

        <View className="h-0 border-b-[1px] border-gray-300" />
      </DrawerContentScrollView>

      {/* Opción de menú para cerrar sesión */}
      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons name="log-out" size={size} color="#fff" />
        )}
        label={"Cerrar sesión"}
        labelStyle={{
          fontSize: 18,
          color: "#fff",
        }}
        style={{
          backgroundColor: "#c11",
          marginTop: "auto",
          borderRadius: 3,
          marginInline: 5,
          marginBlock: 20,
        }}
        onPress={() => {
          router.push("/"); // Navega a la página principal
        }}
      />
    </View>
  );
};
