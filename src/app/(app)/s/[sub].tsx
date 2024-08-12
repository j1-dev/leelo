import { Text, View } from "react-native";
import { useAuth } from "../../../lib/ctx";
import { ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { Button } from "@rneui/themed";
import { useLocalSearchParams, router } from "expo-router";

export default function Sub() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, signOut, loading } = useAuth();
  const { sub } = useLocalSearchParams();

  useEffect(() => {
    console.log(sub);
    const getPosts = async () => {
      await supabase
        .from("posts")
        .select("*")
        .eq("subforum_id", sub)
        .then((res) => res.data)
        .then((data: Post[]) => {
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
              onTouchStart={() => router.push(`/s/${sub}/p/${value.id}`)}
            >
              <Text>{value.title}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View className="border border-black absolute z-50 bottom-36 left">
        <Button onPress={() => router.push(`/s/${sub}/create`)}>
          Create post
        </Button>
      </View>
    </View>
  );
}
