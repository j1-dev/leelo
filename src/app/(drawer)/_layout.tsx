import { Drawer } from "expo-router/drawer";
import { DrawerUserContent } from "@/components/DrawerUserContent";
import { StatusBar } from "expo-status-bar";

export default function Root() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <DrawerUserContent props={props} />}
    >
      <StatusBar style="dark" backgroundColor="white" translucent={true} />

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
