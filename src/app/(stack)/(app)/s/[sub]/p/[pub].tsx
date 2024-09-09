import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { Post } from "@/lib/types";
import { useAuth } from "@/lib/ctx";
import { fetchPost, fetchComments, submitComment, fetchSub } from "@/lib/api";
import { Stack, useLocalSearchParams } from "expo-router";
import { usePost } from "@/lib/postCtx";
import { renderComments } from "@/components/CommentRenderer";
import { useSub } from "@/lib/subCtx";
import { SafeAreaView } from "react-native";
import CommentBar from "@/components/CommentBar";

export default function Pub() {
  const postCtx = usePost();
  const subCtx = useSub();
  const [post, setPost] = useState<Post | null>(null);
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
      postCtx.setUpdate(true);
    } catch (error) {
      Alert.alert("Error", "Failed to submit comment");
    }
  };

  useEffect(() => {
    const loadPostAndComments = async () => {
      try {
        postCtx.setPostId(pub);
        const postData = await fetchPost(pub as string);
        setPost(postData);
      } catch (error) {
        console.error(error);
      }
    };
    loadPostAndComments();
    setLoading(false);
  }, [pub]);

  if (loading || !post)
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;

  return (
    <View className="relative h-full bg-white">
      <Stack.Screen
        options={{
          headerTitle: postCtx.title,
        }}
      />
      {post && (
        <View
          className={`w-full p-4 bg-white border-b-[1px]`}
          style={{ borderColor: subCtx.accent }}
        >
          <Text className="text-2xl font-bold">{post.title}</Text>
          <Text className="text-base mt-2">{post.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </View>
      )}
      <SafeAreaView className="h-screen flex-1 bg-white">
        {postCtx.comments
          ? renderComments(
              postCtx.comments,
              null,
              sub as string,
              pub as string,
              3,
              0,
              subCtx.accent
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
