import React from "react";
import { FlatList, View, Text } from "react-native";
import { Subforum } from "@/lib/types";
import SubCard from "./SubCard"; // Adjust the import path based on your project structure

export const renderSubs = (subList: Subforum[]) => (
  <FlatList
    data={subList}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View className="p-2">
        <SubCard subforum={item} />
      </View>
    )}
    ListEmptyComponent={
      <Text className="text-center text-gray-500 mt-4">
        No subforums available.
      </Text>
    }
  />
);
