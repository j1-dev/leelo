import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-url-polyfill/auto";
import Auth from "../components/Auth";
import { supabase } from "../lib/supabase";

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View>
      <Auth />
    </View>
  );
}
