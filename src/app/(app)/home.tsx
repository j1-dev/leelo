import { renderSubs } from "@/components/SubRenderer";
import { fetchSubs } from "@/lib/api";
import { useAuth } from "@/lib/ctx";
import { Subforum } from "@/lib/types";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

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
    return <Text>Loading...</Text>;
  }

  return (
    <View className="bg-white flex h-screen relative">{renderSubs(subs)}</View>
  );
}
