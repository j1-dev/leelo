import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Link, Stack, useRouter } from "expo-router";
import { deleteComment, fetchComment, submitComment } from "@/lib/utils/api";
import { Comment, Subforum } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { usePub } from "@/lib/context/Pub";
import { useSub } from "@/lib/context/Sub";
import { renderComments } from "@/components/CommentRenderer";
import { SafeAreaView } from "react-native";
import CommentBar from "@/components/CommentBar";
import { Button } from "@rneui/themed";

export default function Comm() {
  const pubCtx = usePub();
  const subCtx = useSub();
  const router = useRouter();
  const { comm, sub, pub } = useLocalSearchParams();
  const { user, loading } = useAuth();
  const [commentHeight, setCommentHeight] = useState();
  const [comment, setComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const commentRef = useRef();

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
      pubCtx.setUpdate(true);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleCommentLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setCommentHeight(height);
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
    pubCtx.setComments((prevComments) =>
      prevComments.filter((comment) => comment.id === commentId),
    );
    router.back();
  };

  if (loading || isLoading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white relative h-full">
      <Stack.Screen
        options={{
          headerTitle: pubCtx.title,
        }}
      />
      <View ref={commentRef} onLayout={handleCommentLayout}>
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
                {user.id === comment.user_id ? (
                  <Button
                    onPress={() => handleDeleteComment(comment.id as string)}
                    containerStyle={{ borderRadius: 8 }}
                  >
                    Delete comment
                  </Button>
                ) : null}
              </View>
            </Link>
          </View>
        )}
      </View>
      <SafeAreaView className="h-screen flex-1 bg-white">
        {pubCtx.comments
          ? renderComments(
              pubCtx.comments,
              comm as string,
              sub as string,
              pub as string,
              3,
              0,
              subCtx.accent,
            )
          : null}
        <CommentBar
          value={newReply}
          onChangeText={setNewReply}
          onSubmit={handleReplySubmit}
          commentId={comm as string}
          pubHeight={commentHeight}
        />
      </SafeAreaView>
    </View>
  );
}
