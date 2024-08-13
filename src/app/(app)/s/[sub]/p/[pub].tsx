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

export default function Pub() {
  const postCtx = usePost();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
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
      // Fetch the updated comments after submitting a new comment
      const updatedComments = await fetchComments(pub as string);
      setComments(updatedComments);
    } catch (error) {
      Alert.alert("Error", "Failed to submit comment");
    }
  };

  useEffect(() => {
    const loadPostAndComments = async () => {
      try {
        const postData = await fetchPost(pub);
        setPost(postData);
        postCtx.setPostId(pub);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPostAndComments();
  }, [pub]);

  const renderComments = (
    commentList: Comment[],
    parentId: string | null = null
  ) => {
    return (
      <FlatList
        data={commentList.filter(
          (comment) => comment.parent_comment === parentId
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 bg-white rounded-lg shadow-md">
            <Link key={item.id} href={`s/${sub}/p/${pub}/c/${item.id}`}>
              <Text className="text-base">{item.content}</Text>
              <Text className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </Link>
            {renderComments(commentList, item.id)}
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">No comments yet.</Text>
        }
      />
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View className="relative">
      {post && (
        <View className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-bold">{post.title}</Text>
          <Text className="text-base mt-2">{post.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </View>
      )}
      <View className="border border-black h-[70%]">
        {postCtx.comments ? renderComments(postCtx.comments) : null}
      </View>

      <View className="absolute -bottom-20 right-0 w-full h-1/6 bg-white z-50">
        <TextInput
          className="p-2 bg-white rounded-lg shadow-md"
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <Button
          title="Submit Comment"
          onPress={handleCommentSubmit}
          buttonStyle={{ backgroundColor: "#2196F3" }}
          containerStyle={{ margin: 8, borderRadius: 8 }}
        />
      </View>
    </View>
  );
}
