import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Subforum } from "@/lib/types";

interface SubCardProps {
  subforum: Subforum;
}

export default function SubCard({ subforum }: SubCardProps) {
  return (
    <View className="bg-white rounded-lg p-4">
      <Link href={`/s/${subforum.id}`} className="w-full flex-1">
        <View>
          <Text className="text-xl font-bold text-gray-800">
            {subforum.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            {subforum.description}
          </Text>
        </View>
      </Link>
    </View>
  );
}
