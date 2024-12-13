import { Drawer } from "expo-router/drawer";
import { DrawerUserContent } from "@/components/DrawerUserContent";
import { StatusBar } from "expo-status-bar";

export default function Root() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }} // Desactiva el encabezado de las pantallas dentro del Drawer
      drawerContent={(props) => <DrawerUserContent props={props} />} // Define el contenido personalizado del Drawer, pasando las props
    >
      <StatusBar style="dark" backgroundColor="white" translucent={true} />{" "}
      {/* Configura la barra de estado con texto oscuro y fondo blanco, permitiendo transparencia */}
      {/* Definición de una pantalla dentro del Drawer */}
      <Drawer.Screen
        name="(stack)"
        options={{
          drawerLabel: "Home",
          title: "overview",
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
