// PostScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
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
import { useLocalSearchParams, router } from "expo-router";

interface PostScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
}

export default function Pub() {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const { user, signOut, loading } = useAuth();
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
        const commentsData = await fetchComments(pub);
        setComments(commentsData);
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
          <View
            className="p-4 bg-white rounded-lg shadow-md mb-2"
            onTouchStart={() => router.push(`s/${sub}/p/${pub}/c/${item.id}`)}
          >
            <Text className="text-base">{item.content}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </Text>
            {renderComments(commentList, item.id)}
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">No comments yet.</Text>
        }
      />
    );
  };

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View className="flex-1 p-4 bg-gray-100">
      {post && (
        <View className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-bold">{post.title}</Text>
          <Text className="text-base mt-2">{post.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </View>
      )}
      {renderComments(comments)}

      <View className="mt-4">
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
          containerStyle={{ marginTop: 8, borderRadius: 8 }}
        />
      </View>
    </View>
  );
}
