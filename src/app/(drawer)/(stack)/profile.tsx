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
import { supabase } from "@/lib/utils/supabase";
import { useAuth } from "@/lib/context/Auth";
import { decode } from "base64-arraybuffer";
import { fetchUser } from "@/lib/utils/api";

export default function Profile() {
  const { user } = useAuth(); // Obtiene el usuario actual desde el contexto de autenticación
  const [username, setUsername] = useState(""); // Estado para el nombre de usuario
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const [profilePic, setProfilePic] = useState(""); // Estado para la URL de la foto de perfil
  const [passwordError, setPasswordError] = useState(true); // Estado para manejar los errores de la contraseña

  useEffect(() => {
    // Al montar el componente, obtiene los datos del usuario y los establece en el estado
    fetchUser(user.id).then((res) => {
      setUsername(res.username); // Establece el nombre de usuario
      setProfilePic(res.profile_pic); // Establece la foto de perfil
    });
  }, []);

  // Función para cambiar la foto de perfil
  const handleChangeProfilePic = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const img = result.assets[0]; // Obtiene la imagen seleccionada
      setProfilePic(img.uri); // Actualiza el estado de la foto de perfil

      // Convierte la imagen seleccionada a base64
      const base64 = await FileSystem.readAsStringAsync(img.uri, {
        encoding: "base64",
      });

      const filePath = `${user.id}/profile_pic.${
        img.type === "image" ? "png" : "mp4"
      }`;

      // Sube la imagen a Supabase Storage
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

      // Crea una URL firmada para acceder a la imagen subida
      const { data: urlData, error: urlError } = await supabase.storage
        .from("profile_pics")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL válida por 7 días

      if (urlError) {
        console.error("Error generando URL firmada:", urlError);
        return;
      }

      // Actualiza la URL de la foto de perfil en la base de datos
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_pic: urlData.signedUrl })
        .eq("id", user?.id);

      if (updateError) {
        console.error("Error subiendo foto de perfil:", updateError);
      }
    }
  };

  // Función para cambiar el nombre de usuario
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

  // Función para cambiar la contraseña
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

  // Función para validar la contraseña
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,!?])[A-Za-z\d!@#$%^&*.,!?]{9,}$/;
    setPasswordError(!passwordRegex.test(password)); // Establece error si la contraseña no cumple con los requisitos
  };

  return (
    <View className="flex-1 items-center p-4 bg-white h-screen">
      {/* Muestra la imagen de perfil */}
      <Image
        source={{ uri: profilePic || "https://via.placeholder.com/150" }}
        className="w-40 h-40 rounded-3xl mb-4 mt-10"
      />
      {/* Botón para cambiar la foto de perfil */}
      <TouchableOpacity onPress={handleChangeProfilePic}>
        <Text className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center text-white font-xl font-bold">
          Cambiar foto de perfil
        </Text>
      </TouchableOpacity>

      {/* Campo para cambiar el nombre de usuario */}
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Nombre de usuario"
        className="border border-gray-300 p-3 w-full mb-4 mt-16 rounded text-3xl"
      />
      {/* Botón para actualizar el nombre de usuario */}
      <TouchableOpacity onPress={handleChangeUsername}>
        <Text className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center text-white font-xl font-bold">
          Actualizar nombre de usuario
        </Text>
      </TouchableOpacity>

      {/* Campo para cambiar la contraseña */}
      <TextInput
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          validatePassword(text); // Valida la contraseña a medida que se escribe
        }}
        placeholder="Contraseña"
        secureTextEntry
        className="border border-gray-300 p-3 w-full mt-10 mb-4 rounded text-3xl"
      />
      {/* Muestra el mensaje de error si la contraseña no es válida */}
      {passwordError && (
        <Text className="text-red-500 text-xs mb-2">
          Las contraseñas deben tener una letra mayúscula, un número, un
          carácter especial y al menos 9 carácteres
        </Text>
      )}
      {/* Botón para actualizar la contraseña, deshabilitado si hay error en la contraseña */}
      <TouchableOpacity onPress={handleChangePassword} disabled={passwordError}>
        <Text className="rounded-xl my-2 p-4 enabled:bg-blue-500 disabled:bg-gray-300 flex justify-center items-center text-white font-xl font-bold">
          Actualizar contraseña
        </Text>
      </TouchableOpacity>
    </View>
  );
}
