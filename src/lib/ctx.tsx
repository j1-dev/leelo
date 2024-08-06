import { Session, User } from "@supabase/supabase-js";
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("session onAuthStateChange: ", session);
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    console.log("error: ", error);
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
