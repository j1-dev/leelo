import { Text, View, Image } from "react-native";
import { router } from "expo-router";
import { Comment } from "@/lib/types";
import { getShadesOfAccent } from "@/lib/colors";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { fetchCommentVote, voteComment } from "@/lib/api";
import { usePost } from "@/lib/postCtx";
import { useState, useEffect } from "react";

interface CommentCardProps {
  sub: string;
  pub: string;
  depth: number;
  item: Comment;
  accent: string;
  isLastThreadComment: boolean;
}

const borderColor = (accent: string, depth: number): string => {
  const { lightShade, darkShade } = getShadesOfAccent(accent);
  return depth % 2 !== 0 ? lightShade : darkShade;
};

export default function CommentCard({
  sub,
  pub,
  depth,
  item,
  accent,
  isLastThreadComment,
}: CommentCardProps) {
  const { updateComment } = usePost();

  // Local state to track score and user's vote
  const [localScore, setLocalScore] = useState<number>(item.score);
  const [currentVote, setCurrentVote] = useState<number | null>(null);

  useEffect(() => {
    const getVote = () => {
      fetchCommentVote(item.id, item.user_id).then((res) =>
        setCurrentVote(res?.vote || null)
      );
    };
    getVote();
  }, []);

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
      await voteComment(item.user_id, item.id, vote);
      updateComment(item.id, { score: newScore });
    } catch (error) {
      // If there's an error, revert optimistic UI change
      console.error("Error voting on comment:", error);
      setLocalScore(item.score); // Revert to original score
      setCurrentVote(null); // Revert vote state
    }
  };

  return (
    <View
      className={`pl-4 pr-3 pt-2 pb-2 bg-white rounded-tl-2xl ${
        isLastThreadComment ? "rounded-bl-2xl" : ""
      } border-t-[1px] border-l-[1px] w-full`}
      style={{ borderColor: borderColor(accent, depth) }}
    >
      <TouchableOpacity
        onPress={() => {
          router.push(`s/${sub}/p/${pub}/c/${item.id}`);
        }}
      >
        <View className="relative">
          <Text className="text-base text-gray-800 mb-1 w-[80%]">
            {item.content}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.created_at).toLocaleString()}
          </Text>
          <View className="absolute right-3 top-3">
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
        </View>
      </TouchableOpacity>
    </View>
  );
}
