import { fetchPubs } from "@/lib/utils/api";
import { Publication } from "@/lib/utils/types";
import { Button } from "@rneui/themed";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/context/Auth";
import { renderPubs } from "@/components/PubRenderer"; // Adjust the import path based on your project structure
import { useSub } from "@/lib/context/Sub";

export default function Sub() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const { name } = useSub();
  const { sub } = useLocalSearchParams();

  useEffect(() => {
    fetchPubs(sub as string)
      .then((data: Publication[]) => {
        setPubs([...data]);
      })
      .catch((error) => console.error(error));
  }, [sub]);

  return (
    <View className="bg-white flex h-screen relative">
      <Stack.Screen
        options={{
          headerTitle: name,
        }}
      />
      {renderPubs(pubs, sub as string)}
      <View className="absolute z-50 bottom-36 left-6">
        <Button
          onPress={() => router.push(`/s/${sub}/create`)}
          containerStyle={{ borderRadius: 8 }}
        >
          Create Publication
        </Button>
      </View>
    </View>
  );
}
