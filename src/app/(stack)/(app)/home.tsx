import { renderSubs } from "@/components/SubRenderer";
import { fetchSubs } from "@/lib/api";
import { useAuth } from "@/lib/ctx";
import { Subforum } from "@/lib/types";
import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { Button } from "@rneui/themed";
import { router } from "expo-router";

export default function Home() {
  const [subs, setSubs] = useState<Subforum[]>([]);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    fetchSubs()
      .then((data: Subforum[]) => {
        setSubs([...data]);
      })
      .catch((e) => {
        throw e;
      });
  });

  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white flex h-screen relative">
      {renderSubs(subs)}
      <View className="absolute z-50 bottom-36 left-6">
        <Button
          onPress={() => router.push(`/create`)}
          containerStyle={{ borderRadius: 8 }}
          buttonStyle={{ backgroundColor: "#ff0000" }}
        >
          Create Subforum
        </Button>
      </View>
    </View>
  );
}
