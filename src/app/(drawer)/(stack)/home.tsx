import { renderSubs } from "@/components/SubRenderer";
import { fetchFollowedSubs, fetchSub } from "@/lib/api";
import { useAuth } from "@/lib/ctx";
import { Subforum } from "@/lib/types";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Button } from "@rneui/themed";

export default function Home() {
  const [subs, setSubs] = useState<Subforum[]>([]);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    fetchFollowedSubs(user.id)
      .then((data) => {
        data.map((item) => {
          fetchSub(item.subforum_id).then((data) => {
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
