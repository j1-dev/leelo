import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/lib/context/Auth";
import { decode } from "base64-arraybuffer";
import { fetchUser } from "@/lib/utils/api";

export default function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [passwordError, setPasswordError] = useState(true);

  useEffect(() => {
    fetchUser(user.id).then((res) => {
      setUsername(res.username);
      setProfilePic(res.profile_pic);
    });
  }, []);

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
        console.error("Error al subir la imagen:", error);
        return;
      }

      // Generate a signed URL for accessing the uploaded image
      const { data: urlData, error: urlError } = await supabase.storage
        .from("profile_pics")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL valid for 7 days

      if (urlError) {
        console.error("Error generando URL firmada:", urlError);
        return;
      }

      // Update the user's profile picture URL in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_pic: urlData.signedUrl })
        .eq("id", user?.id);

      if (updateError) {
        console.error("Error subiendo foto de perfil:", updateError);
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
        console.error("Error actualizando nombre de usuario:", error);
      } else {
        alert("Nombre de usuario actualizado correctamente");
      }
    }
  };

  const handleChangePassword = async () => {
    if (password.trim() !== "") {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Error actualizando contraseña:", error);
      } else {
        alert("Contraseña actualizada correctamente");
      }
    }
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,!?])[A-Za-z\d!@#$%^&*.,!?]{9,}$/;
    setPasswordError(!passwordRegex.test(password));
  };

  return (
    <View className="flex-1 items-center p-4 bg-white h-screen">
      <Image
        source={{ uri: profilePic || "https://via.placeholder.com/150" }}
        className="w-40 h-40 rounded-3xl mb-4 mt-10"
      />
      <TouchableOpacity onPress={handleChangeProfilePic}>
        <Text className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center text-white font-xl font-bold">
          Cambiar foto de perfil
        </Text>
      </TouchableOpacity>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Nombre de usuario"
        className="border border-gray-300 p-3 w-full mb-4 mt-16 rounded text-3xl"
      />
      <TouchableOpacity onPress={handleChangeUsername}>
        <Text className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center text-white font-xl font-bold">
          Actualizar nombre de usuario
        </Text>
      </TouchableOpacity>

      <TextInput
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          validatePassword(text);
        }}
        placeholder="Contraseña"
        secureTextEntry
        className="border border-gray-300 p-3 w-full mt-10 mb-4 rounded text-3xl"
      />
      {passwordError && (
        <Text className="text-red-500 text-xs mb-2">
          Las contraseñas deben tener una letra mayúscula, un número, un
          carácter especial y al menos 9 carácteres
        </Text>
      )}
      <TouchableOpacity onPress={handleChangePassword} disabled={passwordError}>
        <Text className="rounded-xl my-2 p-4 enabled:bg-blue-500 disabled:bg-gray-300 flex justify-center items-center text-white font-xl font-bold">
          Actualizar contraseña
        </Text>
      </TouchableOpacity>
    </View>
  );
}
