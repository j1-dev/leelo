import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button } from "@rneui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchComment, fetchComments, submitComment } from "@/lib/api";
import { Comment } from "@/lib/types";
import { useAuth } from "@/lib/ctx";

const CommentScreen: React.FC = () => {
  const { comm, sub, pub } = useLocalSearchParams();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");

  useEffect(() => {
    const loadCommentAndReplies = async () => {
      try {
        const commentData = await fetchComment(comm as string);
        setComment(commentData);
        const repliesData = await fetchComments(pub as string, comm as string);
        setReplies(repliesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCommentAndReplies();
  }, [comm, pub]);

  const handleReplySubmit = async () => {
    if (newReply.trim().length === 0) {
      Alert.alert("Error", "Reply cannot be empty");
      return;
    }

    try {
      await submitComment(user.id, pub as string, newReply, comm as string);
      setNewReply("");
      const updatedReplies = await fetchComments(pub as string, comm as string);
      setReplies(updatedReplies);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const renderReply = ({ item }: { item: Comment }) => (
    <TouchableOpacity
      onPress={() => router.push(`/s/${sub}/p/${pub}/c/${item.id}`)}
    >
      <View className="p-4 border-b border-gray-300">
        <Text className="text-gray-800">{item.content}</Text>
        <Text className="text-gray-500 text-sm">by User {item.user_id}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="flex-1 p-4">
      {comment && (
        <View className="mb-4">
          <Text className="text-xl font-bold">{comment.content}</Text>
          <Text className="text-gray-500 mt-2">by User {comment.user_id}</Text>
        </View>
      )}
      <FlatList
        data={replies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReply}
      />
      <View className="flex-row mt-4">
        <TextInput
          className="flex-1 border border-gray-300 p-2 rounded"
          placeholder="Add a reply..."
          value={newReply}
          onChangeText={setNewReply}
        />
        <Button
          title="Reply"
          onPress={handleReplySubmit}
          className="ml-2 bg-blue-500 text-white p-2 rounded"
        />
      </View>
    </View>
  );
};

export default CommentScreen;
