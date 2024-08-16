import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TextInput, Alert } from "react-native";
import { Button } from "@rneui/themed";
import { Post, Comment, Subforum } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/ctx";
import { fetchPost, fetchComments, submitComment, fetchSub } from "@/lib/api";
import { useLocalSearchParams } from "expo-router";
import { usePost } from "@/lib/postCtx";
import { renderComments } from "@/components/CommentRenderer";
import { InputAccessoryView, Platform } from "react-native";
import { useSub } from "@/lib/subCtx";

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
    return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View className="relative h-full bg-white pt-14">
      {post && (
        <View
          className={`mt-4 w-full p-4 bg-white border-b-[1px]`}
          style={{ borderColor: subCtx.accent }}
        >
          <Text className="text-2xl font-bold">{post.title}</Text>
          <Text className="text-base mt-2">{post.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </View>
      )}
      <View className="h-screen bg-white pb-60">
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
      </View>

      {Platform.OS === "ios" ? (
        <InputAccessoryView className="absolute bottom-0 w-full bg-white z-50 p-3 border border-gray-300 shadow-md">
          <View className="w-full h-full bg-white relative">
            <TextInput
              className="p-2 bg-white rounded-lg border border-gray-300 h-14 w-5/6 left-0"
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <View className="top-1 right-0 absolute">
              <Button
                title="Send"
                onPress={handleCommentSubmit}
                buttonStyle={{ backgroundColor: "#2196F3" }}
                containerStyle={{ borderRadius: 8 }}
              />
            </View>
          </View>
        </InputAccessoryView>
      ) : (
        <View className="absolute bottom-0 w-full bg-white z-50 p-3 border border-gray-300 shadow-md">
          <View className="w-full h-full bg-white relative">
            <TextInput
              className="p-2 bg-white rounded-lg border border-gray-300 h-14 w-5/6 left-0"
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <View className="top-1 right-0 absolute">
              <Button
                title="Send"
                onPress={handleCommentSubmit}
                buttonStyle={{ backgroundColor: "#2196F3" }}
                containerStyle={{ borderRadius: 8 }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
