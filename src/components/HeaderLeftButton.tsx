import { View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";

interface HeaderLeftButtonProps {
  show: boolean;
}

export default function HeaderLeftButton({ show }: HeaderLeftButtonProps) {
  const router = useRouter();
  const nav = useNavigation<DrawerNavigationProp<{}>>();

  return (
    <View className="top-14 left-4 z-10 w-10">
      {/* Ícono que cambia según el valor de 'show' */}
      <Feather
        name={show ? "menu" : "arrow-left"} // Muestra el ícono de 'menu' o 'flecha izquierda' dependiendo de 'show'
        size={32}
        color="black"
        onPress={() => {
          // Si 'show' es verdadero, abre el Drawer, de lo contrario navega hacia atrás
          show ? nav.openDrawer() : router.back();
        }}
      />
    </View>
  );
}
