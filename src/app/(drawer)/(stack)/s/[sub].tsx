import { deleteSub } from "@/lib/utils/api";
import { Button } from "@rneui/themed";
import { Stack, router, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useAuth } from "@/lib/context/Auth";
import { renderPubs } from "@/components/PubRenderer";
import { useSub } from "@/lib/context/Sub";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

export default function Sub() {
  const router = useRouter();
  const { user } = useAuth();
  const subCtx = useSub();
  const { sub } = useLocalSearchParams();

  // useFocusEffect se ejecuta cada vez que esta vista está enfocada
  // updatear el contexto del subforo
  useFocusEffect(
    useCallback(() => {
      subCtx.setUpdate(true);
    }, [subCtx.pubs]),
  );

  // Función para manejar el borro del subforo
  const handleDeleteSub = (subId: string) => {
    Alert.alert(
      "Confirmar borrado",
      "¿Está seguro de que quiere borrar este subforo? Esta acción no se podrá deshacer",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => {
            deleteSub(subId);
            router.push("/home");
          },
        },
      ],
    );
  };

  return (
    <View className="bg-white flex h-screen relative">
      <Stack.Screen
        options={{
          headerTitle: subCtx.name,
        }}
      />
      {renderPubs(subCtx.pubs, subCtx.accent)}
      <View className="absolute z-50 bottom-36 left-6">
        <TouchableOpacity onPress={() => router.push(`/s/${sub}/create`)}>
          <Feather
            name="plus-circle"
            size={48}
            color="#FFFFFF"
            className="bg-blue-500 p-3 rounded-3xl"
          />
        </TouchableOpacity>
      </View>
      {/* Solo mostrar botón de borrar si el usuario actual es el creador del subforo */}
      {user.id === subCtx.createdBy ? (
        <View className="absolute z-50 bottom-36 right-6">
          <TouchableOpacity onPress={() => handleDeleteSub(sub as string)}>
            <Feather
              name="trash-2"
              size={48}
              color="#FFFFFF"
              className="bg-[#cc1111] p-3 rounded-3xl"
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
