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
    <View className="top-14 left-4 z-50">
      <Feather
        name={show ? "menu" : "arrow-left"}
        size={32}
        color="black"
        onPress={() => {
          show ? nav.openDrawer() : router.back();
        }}
      />
    </View>
  );
}
