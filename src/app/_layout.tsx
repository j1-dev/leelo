import { Stack } from "expo-router";
import "@/global.css";
import AuthProvider from "@/lib/ctx";
import PostProvider from "@/lib/postCtx";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <AuthProvider>
      <PostProvider>
        <Stack
          screenOptions={{ animation: "slide_from_right", headerShown: false }}
        />
      </PostProvider>
    </AuthProvider>
  );
}
