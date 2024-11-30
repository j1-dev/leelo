import { renderSubs } from "@/components/SubRenderer";
import { fetchSubs } from "@/lib/utils/api";
import { useAuth } from "@/lib/context/Auth";
import { Subforum } from "@/lib/utils/types";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function Home() {
  const [subs, setSubs] = useState<Subforum[]>([]);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    fetchSubs()
      .then((data: Subforum[]) => {
        setSubs([...data]);
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
