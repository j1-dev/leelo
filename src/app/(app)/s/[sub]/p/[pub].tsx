// PostScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Button } from "@rneui/themed";
import { Post, Comment } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/ctx";
import { fetchPost, fetchComments, submitComment } from "@/lib/api";
import { useLocalSearchParams, Link } from "expo-router";
import { usePost } from "@/lib/postCtx";
import { renderComments } from "@/components/CommentRenderer";

export default function Pub() {
  const postCtx = usePost();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>(null);
  const [newComment, setNewComment] = useState("");
  const { user, signOut, loading, setLoading } = useAuth();
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
        const postData = await fetchPost(pub);
        setPost(postData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadPostAndComments();
  }, [pub]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View className="relative h-full bg-white pt-14">
      {post && (
        <View className="mb-4 p-4 bg-white rounded-lg">
          <Text className="text-2xl font-bold">{post.title}</Text>
          <Text className="text-base mt-2">{post.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </View>
      )}
      <View className="h-[70%] bg-white">
        {postCtx.comments
          ? renderComments(
              postCtx.comments,
              null,
              sub as string,
              pub as string,
              3
            )
          : null}
      </View>

      <View className="absolute bottom-0 w-full bg-white z-50 p-3 border border-gray-300 shadow-md">
        <TextInput
          className="p-2 bg-white rounded-lg border border-gray-300 h-14"
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <Button
          title="Submit Comment"
          onPress={handleCommentSubmit}
          buttonStyle={{ backgroundColor: "#2196F3" }}
          containerStyle={{ marginTop: 8, borderRadius: 8 }}
        />
      </View>
    </View>
  );
}
