import { Stack } from "expo-router";
import "@/global.css";
import AuthProvider from "@/lib/context/Auth";
import PubProvider from "@/lib/context/Pub";
import SubProvider from "@/lib/context/Sub";
import { StatusBar } from "expo-status-bar";

export default function Root() {
  // Configura los contextos de autenticación, publicaciones y subforos, y luego renderiza la aplicación
  return (
    <AuthProvider>
      <SubProvider>
        <PubProvider>
          {/* Configura la barra de estado con texto oscuro, fondo blanco y translucidez */}
          <StatusBar style="dark" backgroundColor="white" translucent={true} />
          {/* Configuración del Stack para manejar la navegación entre pantallas */}
          <Stack
            screenOptions={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
        </PubProvider>
      </SubProvider>
    </AuthProvider>
  );
}
