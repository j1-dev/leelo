import { renderSubs } from "@/components/SubRenderer";
import { fetchFollowedSubs, fetchSub } from "@/lib/utils/api";
import { useAuth } from "@/lib/context/Auth";
import { Subforum } from "@/lib/utils/types";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const [subs, setSubs] = useState<Subforum[]>([]);
  const { user, loading } = useAuth();
  const { replace } = useRouter();

  useEffect(() => {
    fetchFollowedSubs(user.id)
      .then((data) => {
        data.map((item) => {
          fetchSub(item.sub_id).then((data) => {
            setSubs((curr) => [...curr, data]);
          });
        });
      })
      .catch((e) => {
        throw e;
      });
  }, []);

  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white flex h-screen relative">{renderSubs(subs)}</View>
  );
}
