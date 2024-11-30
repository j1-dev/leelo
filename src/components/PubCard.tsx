import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Publication } from "@/lib/utils/types";
import { usePub } from "@/lib/context/Pub";

interface PubCardProps {
  pub: Publication;
  sub: string;
}

export default function PubCard({ pub, sub }: PubCardProps) {
  const pubCtxt = usePub();

  return (
    <View className="bg-white rounded-lg p-4">
      <Link
        href={`/s/${sub}/p/${pub.id}`}
        onPress={() => pubCtxt.setPubId(pub.id)}
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
