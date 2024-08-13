import { fetchPosts } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { Button } from "@rneui/themed";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useAuth } from "../../../lib/ctx";

export default function Sub() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, signOut, loading, setLoading } = useAuth();
  const { sub } = useLocalSearchParams();

  useEffect(() => {
    console.log(loading);
    fetchPosts(sub).then((data: Post[]) => {
      setPosts([...data]);
    });
    console.log(loading);
  }, [sub]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="flex h-screen relative">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link key={item.id} href={`/s/${sub}/p/${item.id}`}>
            <View key={item.id} className="w-full h-20">
              <Text key={item.id}>{item.title}</Text>
            </View>
          </Link>
        )}
      />
      <View className="absolute z-50 bottom-36 left-6">
        <Button
          onPress={() => router.push(`/s/${sub}/create`)}
          containerStyle={{ borderRadius: 8 }}
        >
          Create post
        </Button>
      </View>
    </View>
  );
}
