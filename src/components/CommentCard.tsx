import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Comment } from "@/lib/types";

interface CommentCardProps {
  sub: string;
  pub: string;
  item: Comment;
}

export default function CommentCard({ sub, pub, item }: CommentCardProps) {
  return (
    <View className="pl-4 pr-3 pt-2 pb-2 bg-white rounded-bl-2xl border-b-[1px] border-l-[1px] border-gray-300 w-full">
      <Link href={`s/${sub}/p/${pub}/c/${item.id}`} className="flex-1">
        <View>
          <Text className="text-base text-gray-800 mb-1">{item.content}</Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </Link>
    </View>
  );
}
