import { renderSubs } from "@/components/SubRenderer";
import {
  fetchFollowedPubs,
  fetchFollowedSubs,
  fetchSub,
} from "@/lib/utils/api";
import { useAuth } from "@/lib/context/Auth";
import { Subforum } from "@/lib/utils/types";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import PubCard from "@/components/PubCard";

export default function Home() {
  const [subs, setSubs] = useState<Subforum[]>([]);
  const [pubs, setPubs] = useState(null);
  const { user, loading } = useAuth();

  useFocusEffect(() => {
    fetchFollowedPubs(user.id).then((res) => {
      console.log(res);
      setPubs(res);
    });
  });

  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    // <View className="bg-white flex h-screen relative">{renderSubs(subs)}</View>
    <View className="bg-white flex h-screen relative">
      {pubs?.map((item) => {
        return (
          <View className="py-1" key={Math.random()}>
            <PubCard
              pub={item.pub}
              sub={item.pub.sub_id}
              accent={item.accent}
            />
          </View>
        );
      })}
    </View>
  );
}
