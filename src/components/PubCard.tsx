import { Text, View, TouchableOpacity } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { Publication } from "@/lib/utils/types";
import { usePub } from "@/lib/context/Pub";
import { useState, useEffect, useCallback } from "react";
import {
  votePublication,
  fetchPublicationVote,
  fetchPub,
} from "@/lib/utils/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSub } from "@/lib/context/Sub";

interface PubCardProps {
  pub: Publication;
  sub: string;
  accent: string;
}

export default function PubCard({ pub, sub, accent }: PubCardProps) {
  const router = useRouter();
  const pubCtx = usePub();
  const subCtx = useSub();
  const { updatePublication, setUpdate } = useSub();
  const [localScore, setLocalScore] = useState(pub.score);
  const [currentVote, setCurrentVote] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const getScore = async () => {
        const pubData = await fetchPub(pub.id);
        setLocalScore(pubData.score);
      };
      const getVote = () => {
        fetchPublicationVote(pub.id, pub.user_id).then((res) =>
          setCurrentVote(res?.vote || null),
        );
      };
      getScore();
      getVote();
    }, []),
  );

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
      setUpdate(true);
      updatePublication(pub.id, { score: newScore });
      await votePublication(pub.user_id, pub.id, vote);
    } catch (error) {
      // If there's an error, revert optimistic UI change
      console.error("Error voting on comment:", error);
      setLocalScore(pub.score); // Revert to original score
      setCurrentVote(null); // Revert vote state
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        pubCtx.setPubId(pub.id);
        subCtx.setSubId(sub);
        router.push(`/s/${sub}/p/${pub.id}`);
      }}
      className={`bg-white mx-3 border p-3 relative rounded-xl`}
      style={{ borderColor: accent }}
    >
      <View>
        <Text className="text-lg font-bold text-gray-800">{pub.title}</Text>
        <Text className="text-sm text-gray-500">
          {new Date(pub.created_at).toLocaleString()}
        </Text>
      </View>
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
    </TouchableOpacity>
  );
}
