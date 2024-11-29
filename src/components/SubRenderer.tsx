import React from "react";
import { FlatList, View, Text } from "react-native";
import { Subforum } from "@/lib/types";
import SubCard from "./SubCard"; // Adjust the import path based on your project structure
import { useAuth } from "@/lib/ctx";
import { useEffect, useState } from "react";
import { fetchFollowedSubs } from "@/lib/api";

export const renderSubs = (subList: Subforum[]) => {
  const { user } = useAuth();
  const [follows, setFollows] = useState([]);

  useEffect(() => {
    fetchFollowedSubs(user.id)
      .then((data) => {
        setFollows(data.map((item) => item.subforum_id));
      })
      .catch((e) => {
        throw e;
      });
  }, []);

  return (
    <FlatList
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
      ListEmptyComponent={
        <Text className="text-center text-gray-500 mt-4">
          No subforums available.
        </Text>
      }
    />
  );
};
