import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Subforum } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { router } from "expo-router";
import { submitSub } from "@/lib/utils/api";
import ColorPicker from "react-native-wheel-color-picker";

export default function CreateSub() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("");
  const { user } = useAuth();

  const handleSubmit = async () => {
    const sub: Subforum = {
      name: name,
      description: description,
      created_at: new Date().toISOString(),
      accent: accent,
      created_by: user.id,
    };
    try {
      await submitSub(sub);
      Alert.alert("Success", "Your subforum has been created!");
      router.push(`/home`); // Redirect to the desired page after submission
    } catch (error) {
      console.error("Error submitting subforum:", error.message);
      Alert.alert("Error", "There was an issue submitting your sub.");
    }
  };

  return (
    <View className="flex-1 bg-white h-full pb-4">
      <View className="flex-1 px-2">
        <Text className="text-3xl font-bold mb-2">Create a New Subforum</Text>
        <TextInput
          className="border p-2 mb-4 rounded"
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="border p-2 mb-4 rounded h-40"
          placeholder="Content"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <View>
          <ColorPicker
            color={accent}
            swatchesOnly={false}
            onColorChange={setAccent}
            thumbSize={40}
            sliderSize={40}
            noSnap={true}
            row={false}
          />
        </View>
      </View>
      <View className="mt-auto mx-3 mb-16">
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
