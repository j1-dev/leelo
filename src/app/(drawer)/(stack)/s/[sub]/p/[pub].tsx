import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button } from "@rneui/themed";
import { Comment, Publication } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import {
  fetchPub,
  submitComment,
  deletePub,
  votePublication,
  fetchPublicationVote,
} from "@/lib/utils/api";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { usePub } from "@/lib/context/Pub";
import { renderComments } from "@/components/CommentRenderer";
import { useSub } from "@/lib/context/Sub";
import { SafeAreaView } from "react-native";
import CommentBar from "@/components/CommentBar";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Pub() {
  const pubCtx = usePub();
  const subCtx = useSub();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [newComment, setNewComment] = useState("");
  const [localScore, setLocalScore] = useState(0);
  const [currentVote, setCurrentVote] = useState<number | null>(null);
  const { user, loading, setLoading } = useAuth();
  const { sub, pub } = useLocalSearchParams();
  const [publicationHeight, setPublicationHeight] = useState(0);
  const commentRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const loadPubAndComments = async () => {
      try {
        pubCtx.setPubId(pub);
        const pubData = await fetchPub(pub as string);
        setPublication(pubData);
        setLocalScore(pubData.score);
      } catch (error) {
        console.error(error);
      }
    };
    const getVote = () => {
      fetchPublicationVote(pubCtx.pubId, pubCtx.userId).then((res) =>
        setCurrentVote(res?.vote || null),
      );
    };
    setLoading(true);
    getVote();
    loadPubAndComments();
    setLoading(false);
  }, []);

  const handlePublicationLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setPublicationHeight(height);
  };

  const handleVote = async (vote: number) => {
    // Optimistic update: Adjust score based on user's vote
    let newScore = localScore;

    if (currentVote === vote) {
      // User is undoing their vote, subtract the vote
      newScore -= vote;
      setCurrentVote(null);
    } else {
      // User is either voting for the first time or switching votes
      if (currentVote !== null) {
        // If there's an existing vote, reverse the old vote and apply the new one
        newScore += vote * 2;
      } else {
        // First time voting, simply add the vote
        newScore += vote;
      }
      setCurrentVote(vote);
    }

    setLocalScore(newScore);

    // Call API to update vote in the backend
    try {
      subCtx.setUpdate(true);
      subCtx.updatePublication(publication.id, { score: newScore });
      await votePublication(publication.user_id, publication.id, vote);
    } catch (error) {
      // If there's an error, revert optimistic UI change
      console.error("Error voting on comment:", error);
      setLocalScore(publication.score); // Revert to original score
      setCurrentVote(null); // Revert vote state
    }
  };

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

  const handleDeletePub = (pubId: string) => {
    deletePub(pubId);
    subCtx.setPubs((prevPubs) => prevPubs.filter((pub) => pub.id !== pubId));
    // subCtx.setUpdate(true);
    router.back();
  };

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
          className={`w-full h-60 p-4 bg-white border-b-[1px]`}
          style={{ borderColor: subCtx.accent }}
          ref={commentRef}
          onLayout={handlePublicationLayout}
        >
          <ScrollView>
            <Text className="text-2xl font-bold">{publication.title}</Text>
            <Text className="text-base mt-2">{publication.content}</Text>
            <Text className="text-xs text-gray-500 mt-2">
              {new Date(publication.created_at).toLocaleString()}
            </Text>
            {!!publication.img_url && (
              <Image
                style={{ width: 200, height: 200, resizeMode: "cover" }}
                src={publication.img_url}
              />
            )}
            {user.id === publication.user_id ? (
              <Button
                onPress={() => handleDeletePub(publication.id)}
                containerStyle={{ borderRadius: 8 }}
              >
                Delete publication
              </Button>
            ) : null}
            <View className="absolute right-4 top-5">
              <View className="flex-row">
                {/* Upvote Button */}
                <TouchableOpacity onPress={() => handleVote(1)}>
                  <AntDesign
                    name="arrowup"
                    className="mr-1 mt-1"
                    size={18}
                    color={currentVote === 1 ? "green" : "gray"} // Highlight if upvoted
                  />
                </TouchableOpacity>

                {/* Display score */}
                <Text className="text-lg font-bold mx-1">{localScore}</Text>

                {/* Downvote Button */}
                <TouchableOpacity onPress={() => handleVote(-1)}>
                  <AntDesign
                    name="arrowdown"
                    className="ml-1 mt-1"
                    size={18}
                    color={currentVote === -1 ? "red" : "gray"} // Highlight if downvoted
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
          pubHeight={publicationHeight}
        />
      </SafeAreaView>
    </View>
  );
}
