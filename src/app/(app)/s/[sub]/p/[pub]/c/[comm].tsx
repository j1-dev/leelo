import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Button } from "@rneui/themed";
import { useLocalSearchParams, Link } from "expo-router";
import { fetchComment, fetchComments, submitComment } from "@/lib/api";
import { Comment } from "@/lib/types";
import { useAuth } from "@/lib/ctx";
import { usePost } from "@/lib/postCtx";

const CommentScreen: React.FC = () => {
  const postCtx = usePost();
  const { comm, sub, pub } = useLocalSearchParams();
  const { user, loading } = useAuth();
  const [comment, setComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");

  useEffect(() => {
    const loadCommentAndReplies = async () => {
      try {
        const commentData = await fetchComment(comm as string);
        setComment(commentData);
        if (!!commentData.parent_comment) {
          const parentData = await fetchComment(commentData.parent_comment);
          setParentComment(parentData);
        } else {
          setParentComment(null);
        }
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
      postCtx.setUpdate(true);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const renderComments = (
    commentList: Comment[],
    parentId: string | null = null
  ) => (
    <FlatList
      data={commentList.filter(
        (comment) => comment.parent_comment === parentId
      )}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="p-4 bg-white rounded-lg shadow-md mb-2">
          <Link href={`s/${sub}/p/${pub}/c/${item.id}`}>
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

  if (loading || isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="flex p-4 bg-gray-100">
      {parentComment && (
        <View className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold">{parentComment.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            by User {parentComment.user_id}
          </Text>
        </View>
      )}
      {comment && (
        <View className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-bold">{comment.content}</Text>
          <Text className="text-xs text-gray-500 mt-2">
            by User {comment.user_id}
          </Text>
        </View>
      )}
      {postCtx.comments
        ? renderComments(postCtx.comments, comm as string)
        : null}
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
          buttonStyle={{ backgroundColor: "#2196F3" }}
          containerStyle={{ marginLeft: 8, borderRadius: 8 }}
        />
      </View>
    </View>
  );
};

export default CommentScreen;
