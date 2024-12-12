import React from "react";
import { FlatList, View, Text } from "react-native";
import { Subforum } from "@/lib/utils/types";
import SubCard from "./SubCard"; // Adjust the import path based on your project structure
import { useAuth } from "@/lib/context/Auth";
import { useEffect, useState } from "react";
import { fetchFollowedSubs } from "@/lib/utils/api";
import { RefreshControl } from "react-native";

interface SubRendererProps {
  subList: Subforum[];
  onReload?: () => void;
}

export default function SubRenderer({ subList, onReload }: SubRendererProps) {
  const { user } = useAuth();
  const [follows, setFollows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFollowedSubs(user.id)
      .then((data) => {
        setFollows(data.map((item) => item.sub_id));
      })
      .catch((e) => {
        throw e;
      });
  }, []);

  const onRefresh = async () => {
    onReload();
  };

  return (
    <FlatList
      className="h-full bg-white"
      data={subList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="p-2">
          <SubCard
            subforum={item}
            userFollows={follows.includes(item.id)}
            userId={user.id}
            key={Math.random()}
          />
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <Text className="text-center text-gray-500 mt-4">
          No subforums available.
        </Text>
      }
    />
  );
}
