import { Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Comment } from "@/lib/types";
import { getShadesOfAccent } from "@/lib/aux";
import { TouchableOpacity } from "react-native";

interface CommentCardProps {
  sub: string;
  pub: string;
  depth: number;
  item: Comment;
  accent: string;
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
}: CommentCardProps) {
  return (
    <View
      className={`pl-4 pr-3 pt-2 pb-2 bg-white rounded-tl-2xl border-t-[1px] border-l-[1px]
      w-full`}
      style={{ borderColor: borderColor(accent, depth) }}
    >
      <TouchableOpacity
        onPress={() => router.push(`s/${sub}/p/${pub}/c/${item.id}`)}
      >
        <View>
          <Text className="text-base text-gray-800 mb-1">{item.content}</Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
