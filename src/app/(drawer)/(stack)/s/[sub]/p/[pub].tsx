import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { Publication } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import {
  fetchPub,
  fetchComments,
  submitComment,
  fetchSub,
} from "@/lib/utils/api";
import { Stack, useLocalSearchParams } from "expo-router";
import { usePub } from "@/lib/context/Pub";
import { renderComments } from "@/components/CommentRenderer";
import { useSub } from "@/lib/context/Sub";
import { SafeAreaView } from "react-native";
import CommentBar from "@/components/CommentBar";

export default function Pub() {
  const pubCtx = usePub();
  const subCtx = useSub();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user, loading, setLoading } = useAuth();
  const { sub, pub } = useLocalSearchParams();

  const handleCommentSubmit = async () => {
    if (newComment.trim().length === 0) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    try {
      await submitComment(user.id, pub as string, newComment);
      setNewComment("");
      pubCtx.setUpdate(true);
    } catch (error) {
      Alert.alert("Error", "Failed to submit comment");
    }
  };

  useEffect(() => {
    const loadPubAndComments = async () => {
      try {
        pubCtx.setPubId(pub);
        const pubData = await fetchPub(pub as string);
        setPublication(pubData);
      } catch (error) {
        console.error(error);
      }
    };
    loadPubAndComments();
    setLoading(false);
  }, [pub]);

  if (loading || !publication)
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;

  return (
    <View className="relative h-full bg-white">
      <Stack.Screen
        options={{
          headerTitle: pubCtx.title,
        }}
      />
      {publication && (
        <View
          className={`w-full p-4 bg-white border-b-[1px]`}
          style={{ borderColor: subCtx.accent }}
        >
          <Text className="text-2xl font-bold">{publication.title}</Text>
          <Text className="text-base mt-2">{publication.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {new Date(publication.created_at).toLocaleString()}
          </Text>
        </View>
      )}
      <SafeAreaView className="h-screen flex-1 bg-white">
        {pubCtx.comments
          ? renderComments(
              pubCtx.comments,
              null,
              sub as string,
              pub as string,
              3,
              0,
              subCtx.accent ? subCtx.accent : "00FF00",
            )
          : null}
        <CommentBar
          value={newComment}
          onChangeText={setNewComment}
          onSubmit={handleCommentSubmit}
        />
      </SafeAreaView>
    </View>
  );
}
