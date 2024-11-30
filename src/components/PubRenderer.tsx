import React from "react";
import { FlatList, View, Text } from "react-native";
import { Publication } from "@/lib/utils/types";
import PubCard from "./PubCard"; // Adjust the import path based on your project structure

export const renderPubs = (pubList: Publication[], sub: string) => (
  <FlatList
    data={pubList}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View className="p-1">
        <PubCard pub={item} sub={sub} />
      </View>
    )}
    ListEmptyComponent={
      <Text className="text-center text-gray-500 mt-4">
        No publications available.
      </Text>
    }
  />
);
