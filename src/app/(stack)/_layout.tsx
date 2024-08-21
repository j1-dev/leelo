import { Drawer } from "expo-router/drawer";
import { DrawerUserContent } from "@/components/DrawerUserContent";

export default function Root() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <DrawerUserContent props={props} />}
    >
      <Drawer.Screen
        name="(app)"
        options={{
          drawerLabel: "Home",
          title: "overview",
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
