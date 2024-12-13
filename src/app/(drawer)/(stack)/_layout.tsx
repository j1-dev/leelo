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
import { StatusBar } from "expo-status-bar";

export default function AppLayout() {
  // Estado local para guardar la foto de perfil del usuario.
  const [profilePic, setProfilePic] = useState(null);

  const router = useRouter();
  const segments = useSegments();

  // Determina si se debe mostrar el botón del menú (drawer) basándose en la ruta actual.
  const showDrawerButton = segments[segments.length - 1] === "home";

  // Condición para mostrar la barra de pestañas (tabBar) únicamente en rutas específicas y con profundidad de navegación limitada.
  const showTabBar =
    ["home", "discover", "create", "profile"].includes(
      segments[segments.length - 1],
    ) && segments.length <= 3; // Ejemplo: pathname -> /home segments -> [(drawer),(stack),home]

  const nav = useNavigation<DrawerNavigationProp<{}>>();
  const { user, session, loading } = useAuth();

  // Mientras se carga la sesión de usuario, muestra un texto indicando que se está cargando.
  if (loading) {
    return <Text>Cargando...</Text>;
  }

  // Si no hay sesión activa, redirige al usuario a la pantalla de autenticación.
  if (!session) {
    return <Redirect href="/" />;
  }

  useEffect(() => {
    // Carga los datos del usuario (como la foto de perfil) al montarse el componente.
    fetchUser(user.id).then((userData) => {
      setProfilePic(userData.profile_pic);
    });
  }, []);

  return (
    <View className="bg-white h-full w-full absolute bottom-0">
      {/* Muestra el botón de menú en iOS si es necesario */}
      {Platform.OS === "ios" && <HeaderLeftButton show={showDrawerButton} />}
      <StatusBar style="dark" backgroundColor="white" translucent={true} />
      <Stack
        screenOptions={{
          gestureEnabled: false, // Deshabilita los gestos de navegación (como deslizamientos).
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
          headerBlurEffect: "systemThickMaterial",
          headerLeft: () => {
            if (Platform.OS !== "ios") {
              // Si está en Android o web, define el comportamiento del botón de la izquierda del encabezado.
              if (showDrawerButton) {
                // Muestra el icono del menú que abre el Drawer.
                return (
                  <Feather
                    name="menu"
                    size={24}
                    color="black"
                    onPress={() => nav.openDrawer()}
                  />
                );
              }
              // Si no hay botón de menú pero puede volver atrás, muestra el icono de retroceso.
              if (router.canGoBack()) {
                return (
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={24}
                    color="black"
                    onPress={() => router.back()}
                  />
                );
              }
            } else return null;
          },
          headerRight: () => (
            // Botón de perfil a la derecha del encabezado. Lleva al usuario a la página de inicio al ser pulsado.
            <TouchableOpacity
              onPress={() => {
                router.push("/home");
              }}
            >
              <Image
                className="w-[42px] h-[42px] rounded-[25px] z-50"
                src={profilePic || WHITE_LOGO_URL} // Usa la foto de perfil o una imagen predeterminada.
                style={{
                  resizeMode: "cover",
                }}
              />
            </TouchableOpacity>
          ),
          headerBackVisible: false, // Desactiva el botón de retroceso predeterminado.
          headerTitleAlign: "center",
        }}
      >
        {/* Configuración de las pantallas dentro del stack de navegación */}
        <Stack.Screen
          name="home"
          options={{
            title: "Inicio",
            animation: "slide_from_right", // Animación al entrar a la pantalla.
          }}
        />
        <Stack.Screen
          name="create"
          options={{
            title: "Crear Sub",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="discover"
          options={{
            title: "Descubre",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: "Perfil",
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
            title: "Crear Publicación",
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
      {/* Muestra la barra de navegación inferior (tabBar) si es necesario */}
      <HomeTabBar show={showTabBar} />
    </View>
  );
}
