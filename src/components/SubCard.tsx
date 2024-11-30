import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Subforum } from "@/lib/utils/types";
import { useSub } from "@/lib/context/Sub";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { followSub, unfollowSub } from "@/lib/utils/api";
import Feather from "@expo/vector-icons/Feather";

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
    <View
      className={`bg-white p-4 border rounded-xl`}
      style={{ borderColor: subforum.accent }}
    >
      <Link
        href={`/s/${subforum.id}`}
        className="w-full flex-1 relative"
        onPress={() => sub.setSubId(subforum.id)}
      >
        <View className="w-4/5 absolute left-0">
          <Text className="text-xl font-bold text-gray-800">
            {subforum.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            {subforum.description}
          </Text>
        </View>
      </Link>
      <TouchableOpacity
        onPress={() => toggleFollow()}
        className="w-1/5 absolute -right-4 top-5 mx-auto"
      >
        {follows ? (
          <Feather name="minus" size={30} color={"#CA1200"} />
        ) : (
          <Feather name="plus" size={30} color={"#007AFF"} />
        )}
        <Text className="text-xs text-gray-500">
          {follows ? "unfollow" : "follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
