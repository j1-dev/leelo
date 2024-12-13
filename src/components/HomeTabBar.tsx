import { usePathname, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, Animated, Platform } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export default function HomeTabBar({ show }: { show: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const [height, setHeight] = useState(64); // Establece la altura de la barra de pestañas
  const activeTab = `/${segments[segments.length - 1]}`; // Determina la pestaña activa según la ruta actual

  const tabs = [
    {
      name: "Inicio",
      route: "/home",
      icon: "home",
    },
    {
      name: "Descubre",
      route: "/discover",
      icon: "search",
    },
    { name: "Crea", route: "/create", icon: "plus-square" },
    { name: "Perfil", route: "/profile", icon: "user" },
  ];

  // Animación para controlar la posición de la barra de pestañas
  const translateY = useRef(new Animated.Value(80)).current; // Se inicia fuera de la pantalla

  // Controla la animación de mostrar/ocultar la barra de pestañas
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: show ? 0 : 80, // Mueve la barra de pestañas hacia arriba o hacia abajo
      duration: 300, // Duración de la animación
      useNativeDriver: true, // Mejora el rendimiento usando el driver nativo
    }).start();

    if (Platform.OS === "ios") {
      setHeight(80); // Aumenta la altura para dispositivos iOS (para evitar que la barra quede recortada)
    }
  }, [show]); // Se ejecuta cada vez que cambia el valor de "show"

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute", // La barra de pestañas está posicionada al final de la pantalla
        bottom: 0,
        left: 0,
        right: 0,
        height: height,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e2e2e2", // Color de la línea superior
        flexDirection: "row", // Alineación horizontal de las pestañas
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={{
            flex: 1,
            marginTop: 12, // Separación vertical
            justifyContent: "flex-start", // Alineación de contenido al inicio
            alignItems: "center", // Centrado de los íconos y texto
          }}
          onPress={() => router.push(tab.route)} // Navega a la ruta de la pestaña
        >
          <Feather
            name={tab.icon}
            size={24}
            color={activeTab === tab.route ? "#007AFF" : "#8E8E93"} // Colorea el ícono según la pestaña activa
          />
          <Text
            style={{
              color: activeTab === tab.route ? "#007AFF" : "#8E8E93", // Cambia el color del texto según la pestaña activa
              fontWeight: activeTab === tab.route ? "bold" : "normal", // Hace el texto en negrita si la pestaña está activa
            }}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}
