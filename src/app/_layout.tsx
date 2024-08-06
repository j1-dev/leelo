import "../global.css";
import { Slot } from "expo-router";
import AuthProvider from "../lib/ctx";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
