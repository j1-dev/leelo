import { supabase } from "@/lib/supabase";
import { Subforum } from "@/lib/types";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/ctx";
import { fetchSubs } from "@/lib/api";

export default function Home() {
  const [subs, setSubs] = useState<Subforum[]>([]);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    fetchSubs().then((data: Subforum[]) => {
      setSubs([...data]);
    });
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="flex h-screen relative">
      <ScrollView className="w-full h-full">
        {subs.map((value: Subforum, index: number) => {
          return (
            <Link href={`/s/${value.id}`}>
              <View key={value.id} className="w-full h-20">
                <Text>{value.name}</Text>
              </View>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}