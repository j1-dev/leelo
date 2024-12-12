import { fetchFollowedPubs } from "@/lib/utils/api";
import { useAuth } from "@/lib/context/Auth";
import { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  RefreshControl,
} from "react-native";
import PubCard from "@/components/PubCard";

export default function Home() {
  const [pubs, setPubs] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    getPubs();
  }, []);

  const getPubs = () => {
    fetchFollowedPubs(user.id).then((res) => {
      setPubs(res);
    });
  };

  const onRefresh = () => {
    getPubs();
  };

  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    // <View className="bg-white flex h-screen relative">{renderSubs(subs)}</View>
    <View className="bg-white flex h-screen relative">
      <FlatList
        data={pubs}
        keyExtractor={(item) => item.pub.id}
        renderItem={({ item }) => (
          <View className="p-2">
            <PubCard
              pub={item.pub}
              sub={item.pub.sub_id}
              accent={item.accent}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">
            No hay publicaciones disponibles.
          </Text>
        }
      />
    </View>
  );
}
