import { Stack } from "expo-router";
import "@/global.css";
import AuthProvider from "@/lib/context/Auth";
import PubProvider from "@/lib/context/Pub";
import SubProvider from "@/lib/context/Sub";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <AuthProvider>
      <SubProvider>
        <PubProvider>
          <Stack
            screenOptions={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
        </PubProvider>
      </SubProvider>
    </AuthProvider>
  );
}
