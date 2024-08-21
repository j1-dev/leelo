import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, View, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { Button, Input, Switch } from "@rneui/themed";
import { decode } from "base64-arraybuffer";

export default function Auth() {
  const [imgData, setImgData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Add username state
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
    if (error) Alert.alert(error.message);
    setLoading(false);
    router.push("/home");
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
      <View className="w-11/12 max-w-md m-auto">
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
                : { backgroundColor: "#4CAF50" }
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
