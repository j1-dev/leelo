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
    fetchSubs().then((data: Subforum[]) => {
      setSubs([...data]);
    });
  });

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="flex h-screen relative">
      <ScrollView className="w-full h-full">
        {subs.map((value: Subforum, index: number) => {
          return (
            <Link
              key={value.id}
              href={`/s/${value.id}`}
              className="w-max h-max"
            >
              <View key={value.id} className="w-full h-20">
                <Text key={value.id}>{value.name}</Text>
              </View>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}
