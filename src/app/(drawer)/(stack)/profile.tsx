import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/utils/supabase"; // Adjust the path as necessary
import { User } from "@/lib/utils/types"; // Adjust the path as necessary
import { useAuth } from "@/lib/context/Auth";
import { decode } from "base64-arraybuffer";

export default function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");

  // Handle profile picture change
  const handleChangeProfilePic = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const img = result.assets[0];
      setProfilePic(img.uri);

      const base64 = await FileSystem.readAsStringAsync(img.uri, {
        encoding: "base64",
      });

      const filePath = `${user.id}/profile_pic.${
        img.type === "image" ? "png" : "mp4"
      }`;

      const { data, error } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, decode(base64), {
          cacheControl: "3600",
          upsert: true,
          contentType: img.mimeType || "image/jpeg",
        });

      if (error) {
        console.error("Error uploading image:", error);
        return;
      }

      // Generate a signed URL for accessing the uploaded image
      const { data: urlData, error: urlError } = await supabase.storage
        .from("profile_pics")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL valid for 7 days

      if (urlError) {
        console.error("Error generating signed URL:", urlError);
        return;
      }

      // Update the user's profile picture URL in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_pic: urlData.signedUrl })
        .eq("id", user?.id);

      if (updateError) {
        console.error("Error updating profile picture:", updateError);
      }
    }
  };

  // Handle username change
  const handleChangeUsername = async () => {
    if (username.trim() !== "") {
      const { error } = await supabase
        .from("users")
        .update({ username })
        .eq("id", user?.id);

      if (error) {
        console.error("Error updating username:", error);
      } else {
        alert("Username updated successfully");
      }
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (password.trim() !== "") {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Error updating password:", error);
      } else {
        alert("Password updated successfully");
      }
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <TouchableOpacity onPress={handleChangeProfilePic}>
        <Image
          source={{ uri: profilePic || "https://via.placeholder.com/150" }}
          className="w-32 h-32 rounded-full mb-4"
        />
        <Text className="text-blue-500">Change Profile Picture</Text>
      </TouchableOpacity>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        className="border rounded p-2 w-full mb-4"
      />
      <Button title="Update Username" onPress={handleChangeUsername} />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="New Password"
        secureTextEntry
        className="border rounded p-2 w-full mt-4 mb-4"
      />
      <Button title="Update Password" onPress={handleChangePassword} />
    </View>
  );
}
