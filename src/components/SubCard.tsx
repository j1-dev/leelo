import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Subforum } from "@/lib/types";
import { useSub } from "@/lib/subCtx";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { followSub, unfollowSub } from "@/lib/api";

// Define props as a single object
interface SubCardProps {
  subforum: Subforum;
  userFollows: boolean;
  userId: string;
}

export default function SubCard({
  subforum,
  userFollows,
  userId,
}: SubCardProps) {
  const sub = useSub();
  const [follows, setFollows] = useState(userFollows);

  const toggleFollow = () => {
    if (follows) {
      unfollowSub(userId, subforum.id);
    } else {
      followSub(userId, subforum.id);
    }
    setFollows(!follows);
  };

  return (
    <View className="bg-white rounded-lg p-4">
      <Link
        href={`/s/${subforum.id}`}
        className="w-full flex-1"
        onPress={() => sub.setSubId(subforum.id)}
      >
        <View>
          <Text className="text-xl font-bold text-gray-800">
            {subforum.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            {subforum.description}
          </Text>
          <TouchableOpacity onPress={() => toggleFollow()}>
            <Text>{follows ? "unfollow" : "follow"}</Text>
          </TouchableOpacity>
        </View>
      </Link>
    </View>
  );
}
