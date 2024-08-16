import { Stack } from "expo-router";
import "@/global.css";
import AuthProvider from "@/lib/ctx";
import PostProvider from "@/lib/postCtx";
import SubProvider from "@/lib/subCtx";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <AuthProvider>
      <SubProvider>
        <PostProvider>
          <Stack
            screenOptions={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
        </PostProvider>
      </SubProvider>
    </AuthProvider>
  );
}
