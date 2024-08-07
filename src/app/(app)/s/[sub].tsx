import { Text, View } from "react-native";
import { useAuth } from "../../../lib/ctx";
import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { useLocalSearchParams, router } from "expo-router";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, signOut, loading } = useAuth();
  const { sub } = useLocalSearchParams();

  useEffect(() => {
    const getPosts = async () => {
      console.log(sub);
      await supabase
        .from("posts")
        .select("*")
        .eq("subforum_id", sub)
        .then((res) => res.data)
        .then((data: Post[]) => {
          console.log(data);
          setPosts([...data]);
        });
    };
    getPosts();
  }, [sub]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="flex h-screen relative">
      <ScrollView className="w-full h-full">
        {posts.map((value: Post, index: number) => {
          return (
            <View
              key={index}
              className="w-full h-20"
              onTouchStart={() => router.replace(`/s/${value.id}`)}
            >
              <Text>{value.title}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
