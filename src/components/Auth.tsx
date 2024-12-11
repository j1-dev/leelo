import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, View, Text, Image } from "react-native";
import { supabase } from "@/lib/utils/supabase";
import { Button, Input, Switch } from "@rneui/themed";

export const BLACK_LOGO_URL =
  "https://syhqbeqnshfljqbkoubc.supabase.co/storage/v1/object/sign/extras/logos/black%20Consulting%20Company%20Logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJleHRyYXMvbG9nb3MvYmxhY2sgQ29uc3VsdGluZyBDb21wYW55IExvZ28ucG5nIiwiaWF0IjoxNzMzOTM4ODA5LCJleHAiOjQ4ODc1Mzg4MDl9.ZRMJ1Du7vrNxbD_yDL46AxqTZGJLFBP1WeXiH3_NQeY&t=2024-12-11T17%3A40%3A09.589Z";
export const BLUE_LOGO_URL =
  "https://syhqbeqnshfljqbkoubc.supabase.co/storage/v1/object/sign/extras/logos/Blue%20Consulting%20Company%20Logo(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJleHRyYXMvbG9nb3MvQmx1ZSBDb25zdWx0aW5nIENvbXBhbnkgTG9nbygxKS5wbmciLCJpYXQiOjE3MzM5Mzg4MzAsImV4cCI6NDg4NzUzODgzMH0._9p95e2rXw0_DYJaCAr3qAX3PZdO3Fm4xsN_UOhN8QY&t=2024-12-11T17%3A40%3A30.427Z";
export const WHITE_LOGO_URL =
  "https://syhqbeqnshfljqbkoubc.supabase.co/storage/v1/object/sign/extras/logos/white%20Consulting%20Company%20Logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJleHRyYXMvbG9nb3Mvd2hpdGUgQ29uc3VsdGluZyBDb21wYW55IExvZ28ucG5nIiwiaWF0IjoxNzMzOTM4ODgxLCJleHAiOjQ4ODc1Mzg4ODF9.wBywyYdGCe8m6CYHguaZvSdZDPTAOJLECNcXsjO9fSY&t=2024-12-11T17%3A41%3A21.593Z";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const signInWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert(error.message);
      return;
    }

    router.push("/home");
    setTimeout(() => {
      router.replace("/home");
    }, 0);
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (user) {
      // Insert the user into the users table
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id, // Use the user's ID from Supabase auth
          username: username,
          email: email,
        },
      ]);

      if (insertError) {
        Alert.alert(insertError.message);
      } else {
        Alert.alert("Please check your inbox for email verification!");
      }

      setLoading(false);
    }
  };

  const clickButton = () => {
    !isEnabled ? signUpWithEmail() : signInWithEmail();
  };

  return (
    <View className="flex h-screen">
      <View className="w-full px-4 m-auto h-screen">
        <Image
          className="max-w-md mx-auto w-[250px] h-[250px] rounded-[25px] mb-5 mt-16"
          src={WHITE_LOGO_URL}
          style={{
            resizeMode: "cover",
          }}
        />
        {!isEnabled && (
          <View className="mb-4 relative">
            <Input
              label="Username"
              leftIcon={{ type: "font-awesome", name: "user" }}
              onChangeText={(text) => setUsername(text)}
              value={username}
              placeholder="Username"
              autoCapitalize={"none"}
              inputContainerStyle={{ borderBottomColor: "#ccc" }}
              labelStyle={{ color: "#555" }}
              inputStyle={{ color: "#333" }}
            />
          </View>
        )}
        <View className="mb-4">
          <Input
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={"none"}
            inputContainerStyle={{ borderBottomColor: "#ccc" }}
            labelStyle={{ color: "#555" }}
            inputStyle={{ color: "#333" }}
          />
        </View>
        <View className="mb-8">
          <Input
            label="Password"
            leftIcon={{ type: "font-awesome", name: "lock" }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={"none"}
            inputContainerStyle={{ borderBottomColor: "#ccc" }}
            labelStyle={{ color: "#555" }}
            inputStyle={{ color: "#333" }}
          />
        </View>
        <View>
          <Button
            title={!isEnabled ? "Sign up" : "Sign in"}
            disabled={loading}
            onPress={() => clickButton()}
            buttonStyle={
              !isEnabled
                ? { backgroundColor: "#2196F3" }
                : { backgroundColor: "#22C55E" }
            }
            containerStyle={{ borderRadius: 8 }}
          />
        </View>
        <View className="m-auto flex-row items-center justify-between mt-4">
          <Text>Sign up</Text>
          <Switch
            value={isEnabled}
            onValueChange={() => setIsEnabled((e) => !e)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
          />
          <Text className="ml-2">Sign in</Text>
        </View>
      </View>
    </View>
  );
}
