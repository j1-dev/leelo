import { View, TextInput, Button, Text, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { Publication } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { useLocalSearchParams, router } from "expo-router";
import { submitPub } from "@/lib/utils/api";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { sub } = useLocalSearchParams();
  const { user, signOut, loading } = useAuth();

  const handleSubmit = async () => {
    const pub: Publication = {
      sub_id: sub as string,
      user_id: user.id,
      title,
      content,
      score: 0,
      created_at: new Date().toISOString(),
    };
    try {
      await submitPub(pub);
      Alert.alert("Success", "Your publication has been submitted!");
      router.push(`s/${sub}/`); // Redirect to the desired page after submission
    } catch (error) {
      console.error("Error submitting publication:", error.message);
      Alert.alert("Error", "There was an issue submitting your publication.");
    }
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-2">Create a New Publication</Text>
      <TextInput
        className="border p-2 mb-4 rounded"
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="border p-2 mb-4 rounded h-40"
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
