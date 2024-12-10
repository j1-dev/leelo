import {
  View,
  TextInput,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
    if (title !== "" && content !== "") {
      try {
        await submitPub(pub);
        Alert.alert("Success", "Your publication has been submitted!");
        router.push(`s/${sub}/`); // Redirect to the desired page after submission
      } catch (error) {
        console.error("Error submitting publication:", error.message);
        Alert.alert("Error", "There was an issue submitting your publication.");
      }
    }
  };

  return (
    <View className="flex-1 bg-white h-full pb-20">
      <View className="flex-1 px-2">
        <Text className="text-xl font-bold mb-2">Create a New Publication</Text>
        <View className="border border-gray-500 rounded-xl mb-2">
          <TextInput
            className="text-xl ml-3"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        <View className="border border-gray-500 rounded-xl mb-2">
          <TextInput
            className="h-40 text-xl ml-3"
            placeholder="Content"
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>
      </View>
      <View className="mt-auto mx-3">
        <TouchableOpacity
          onPress={handleSubmit}
          className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center"
        >
          <Text className="text-xl font-bold text-white">Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          className="rounded-xl my-2 p-4 bg-green-500 flex justify-center items-center"
        >
          <Text className="text-xl font-bold text-white">Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
