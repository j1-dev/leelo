import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Alert, ActivityIndicator } from "react-native";
import { Button } from "@rneui/themed";
import { useLocalSearchParams, Link } from "expo-router";
import { fetchComment, fetchSub, submitComment } from "@/lib/api";
import { Comment, Subforum } from "@/lib/types";
import { useAuth } from "@/lib/ctx";
import { usePost } from "@/lib/postCtx";
import { useSub } from "@/lib/subCtx";
import { renderComments } from "@/components/CommentRenderer";
import { InputAccessoryView, Platform } from "react-native";

export default function Comm() {
  const postCtx = usePost();
  const subCtx = useSub();
  const { comm, sub, pub } = useLocalSearchParams();
  const { user, loading } = useAuth();
  const [comment, setComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [subforum, setSubforum] = useState<Subforum | null>(null);
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
      }
    };

    loadCommentAndReplies();
    setLoading(false);
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

  if (loading || isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="bg-white relative h-full">
      {parentComment && (
        <Link href={`s/${sub}/p/${pub}/c/${parentComment.id}`}>
          <View className="mb-4 p-4 bg-white rounded-lg">
            <Text className="text-lg font-bold">{parentComment.content}</Text>
            <Text className="text-xs text-gray-500 mt-2">
              by User {parentComment.user_id}
            </Text>
          </View>
        </Link>
      )}
      {comment && (
        <View
          className="mt-4 p-4 w-full bg-white border-b-[1px]"
          style={{ borderColor: subCtx.accent }}
        >
          <Link href={`s/${sub}/p/${pub}/c/${comment.id}`}>
            <View>
              <Text className="text-2xl font-bold">{comment.content}</Text>
              <Text className="text-xs text-gray-500 mt-2">
                by User {comment.user_id}
              </Text>
            </View>
          </Link>
        </View>
      )}
      <View className="h-screen bg-white pb-60">
        {postCtx.comments
          ? renderComments(
              postCtx.comments,
              comm as string,
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
              value={newReply}
              onChangeText={setNewReply}
            />
            <View className="top-1 right-0 absolute">
              <Button
                title="Send"
                onPress={handleReplySubmit}
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
              value={newReply}
              onChangeText={setNewReply}
            />
            <View className="top-1 right-0 absolute">
              <Button
                title="Send"
                onPress={handleReplySubmit}
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
