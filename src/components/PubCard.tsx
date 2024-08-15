import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Post } from "@/lib/types";
import { usePost } from "@/lib/postCtx";

interface PubCardProps {
  pub: Post;
  sub: string;
}

export default function PubCard({ pub, sub }: PubCardProps) {
  const postCtx = usePost();

  return (
    <View className="bg-white rounded-lg p-4">
      <Link
        href={`/s/${sub}/p/${pub.id}`}
        onPress={() => postCtx.setPostId(pub.id)}
        className="w-full flex-1"
      >
        <View>
          <Text className="text-lg font-bold text-gray-800">{pub.title}</Text>
          <Text className="text-sm text-gray-500">
            {new Date(pub.created_at).toLocaleString()}
          </Text>
        </View>
      </Link>
    </View>
  );
}
