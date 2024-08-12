import { View, TextInput, Button, Text, Alert, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { useAuth } from "@/lib/ctx";

import { useLocalSearchParams, router } from "expo-router";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { sub } = useLocalSearchParams();
  const { user, signOut, loading } = useAuth();

  const handleSubmit = async () => {
    const post = {
      subforum_id: sub,
      user_id: user.id,
      title,
      content,
      score: 0,
      created_at: new Date().toISOString(),
    };

    try {
      // Insert the new post into the "posts" table
      const { data, error } = await supabase.from("posts").insert([post]);

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Your post has been submitted!");
      router.navigate(`s/${sub}/`); // Redirect to the desired page after submission
    } catch (error) {
      console.error("Error submitting post:", error.message);
      Alert.alert("Error", "There was an issue submitting your post.");
    }
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-2">Create a New Post</Text>
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
