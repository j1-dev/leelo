import { Text, View, Image } from "react-native";
import { router } from "expo-router";
import { Comment } from "@/lib/types";
import { getShadesOfAccent } from "@/lib/colors";
import { TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { fetchUser } from "@/lib/api";

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
  if (depth % 2 !== 0) {
    return lightShade;
  } else {
    return darkShade;
  }
};

export default function CommentCard({
  sub,
  pub,
  depth,
  item,
  accent,
  isLastThreadComment,
}: CommentCardProps) {
  const [pic, setPic] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const user = await fetchUser(item.user_id);
      setPic(user.profile_pic);
    };

    getUser();
  }, []);
  return (
    <View
      className={`pl-4 pr-3 pt-2 pb-2 bg-white rounded-tl-2xl ${
        isLastThreadComment ? "rounded-bl-2xl" : ""
      }  border-t-[1px] border-l-[1px]
      w-full`}
      style={{ borderColor: borderColor(accent, depth) }}
    >
      <TouchableOpacity
        onPress={() => router.push(`s/${sub}/p/${pub}/c/${item.id}`)}
      >
        <View className="relative">
          <Text className="text-base text-gray-800 mb-1 w-[80%]">
            {item.content}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.created_at).toLocaleString()}
          </Text>
          <Image
            source={{ uri: pic }}
            height={40}
            width={40}
            className="rounded-full absolute right-3 top-1"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
