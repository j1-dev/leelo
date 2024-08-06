import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, View, Text } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input, Switch } from "@rneui/themed";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    console.log({ data: { session } });
    if (error) Alert.alert(error.message);
    setLoading(false);
    router.replace("/");
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    console.log({ data: { session } });
    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  };

  const clickButton = () => {
    !isEnabled ? signUpWithEmail() : signInWithEmail();
  };

  return (
    <View className="flex h-screen">
      <View className="w-11/12 max-w-md m-auto">
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
        {/* <View className="mb-4">
          <Button
            title="Sign in"
            disabled={loading}
            onPress={() => signInWithEmail()}
            buttonStyle={{ backgroundColor: "#4CAF50" }}
            containerStyle={{ borderRadius: 8 }}
          />
        </View>
        <View>
          <Button
            title="Sign up"
            disabled={loading}
            onPress={() => signUpWithEmail()}
            buttonStyle={{ backgroundColor: "#2196F3" }}
            containerStyle={{ borderRadius: 8 }}
          />
        </View> */}
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
