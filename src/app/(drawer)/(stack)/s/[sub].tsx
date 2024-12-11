import { deleteSub } from "@/lib/utils/api";
import { Button } from "@rneui/themed";
import { Stack, router, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/lib/context/Auth";
import { renderPubs } from "@/components/PubRenderer"; // Adjust the import path based on your project structure
import { useSub } from "@/lib/context/Sub";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

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
      {renderPubs(subCtx.pubs, sub as string)}
      <View className="absolute z-50 bottom-36 left-6">
        <Button
          onPress={() => router.push(`/s/${sub}/create`)}
          containerStyle={{ borderRadius: 8 }}
        >
          Create Publication
        </Button>
      </View>
      {user.id === subCtx.createdBy ? (
        <View className="absolute z-50 bottom-36 right-6">
          <Button
            onPress={() => handleDeleteSub(sub as string)}
            containerStyle={{ borderRadius: 8 }}
          >
            Delete Subforum
          </Button>
        </View>
      ) : null}
    </View>
  );
}
