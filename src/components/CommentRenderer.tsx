import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import CommentCard from "./CommentCard"; // Adjust the import path based on your project structure
import { Comment } from "@/lib/types";
import { Link } from "expo-router";
import { getShadesOfAccent } from "@/lib/aux";

const borderColor = (accent: string, depth: number): string => {
  const { lightShade, darkShade } = getShadesOfAccent(accent);
  if (depth % 2 === 0) {
    return lightShade;
  } else {
    return darkShade;
  }
};

export const renderComments = (
  commentList: Comment[],
  parentId: string | null = null,
  sub: string,
  pub: string,
  maxDepth: number, // Parameter to limit depth
  currentDepth: number = 0, // Keep track of current depth
  accent: string
) => {
  return (
    <FlatList
      data={commentList.filter(
        (comment) => comment.parent_comment === parentId
      )}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          className={`pl-4 pt-4 bg-white ${
            currentDepth !== 0 ? "border-l-[1px]" : ""
          } rounded-bl-2xl`}
          style={{ borderColor: borderColor(accent, currentDepth) }}
        >
          <CommentCard
            sub={sub}
            pub={pub}
            item={item}
            depth={currentDepth}
            accent={accent}
          />
          {currentDepth < maxDepth ? (
            renderComments(
              commentList,
              item.id,
              sub,
              pub,
              maxDepth,
              currentDepth + 1,
              accent
            )
          ) : (
            <TouchableOpacity className="ml-4 mt-2">
              <Link
                href={`s/${sub}/p/${pub}/c/${parentId}`}
                className="text-blue-500 underline"
              >
                <Text>Show more comments</Text>
              </Link>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};
