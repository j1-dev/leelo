import { fetchPosts } from "@/lib/api";
import { Post } from "@/lib/types";
import { Button } from "@rneui/themed";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/ctx";
import { renderPubs } from "@/components/PubRenderer"; // Adjust the import path based on your project structure

export default function Sub() {
  const [pubs, setPubs] = useState<Post[]>([]);
  const { user, signOut, loading, setLoading } = useAuth();
  const { sub } = useLocalSearchParams();

  useEffect(() => {
    fetchPosts(sub as string)
      .then((data: Post[]) => {
        setPubs([...data]);
      })
      .catch((error) => console.error(error));
  }, [sub]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="bg-white flex h-screen relative">
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
