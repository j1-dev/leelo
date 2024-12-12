import { deleteSub } from "@/lib/utils/api";
import { Button } from "@rneui/themed";
import { Stack, router, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useAuth } from "@/lib/context/Auth";
import { renderPubs } from "@/components/PubRenderer"; // Adjust the import path based on your project structure
import { useSub } from "@/lib/context/Sub";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import Feather from "@expo/vector-icons/Feather";

export default function Sub() {
  const router = useRouter();
  const { user } = useAuth();
  const subCtx = useSub();
  const { sub } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      subCtx.setUpdate(true);
    }, [subCtx.pubs]),
  );

  const handleDeleteSub = (subId: string) => {
    deleteSub(subId);
    router.back();
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
