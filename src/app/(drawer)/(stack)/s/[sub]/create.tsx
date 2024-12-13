import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { Publication } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { useLocalSearchParams, router } from "expo-router";
import { submitPub } from "@/lib/utils/api";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/utils/supabase";
import { decode } from "base64-arraybuffer";
import { useSub } from "@/lib/context/Sub";
import Feather from "@expo/vector-icons/Feather";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { sub } = useLocalSearchParams();
  const subCtx = useSub();
  const { user } = useAuth();

  // Función para subir una imágen de la galería
  const handleImagePick = async () => {
    // Pedir permiso para usar la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Debe dar permiso para acceder a la galería.",
      );
      return;
    }

    // Abrir galería y seleccionar imágen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // Si no se cancela, se pone la imagen en una variable de estado
    if (!result.canceled) {
      const img = result.assets[0];
      setImageUri(img.uri);
    }
  };

  // Función para enviar publicación
  const handleSubmit = async () => {
    // Crear publicación vacia
    const pub: Publication = {
      sub_id: sub as string,
      user_id: user.id,
      title,
      content,
      score: 0,
      created_at: new Date().toISOString(),
    };

    // Si se ha seleccionado una imagen
    if (imageUri) {
      try {
        // Preparación para subir la imágen al bucket "publication_images" de supabase
        const publicationId = pub.created_at;
        const fileName = `image.jpg`;
        const fileUri = imageUri;
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: "base64",
        });
        const filePath = `${publicationId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from("publication_images")
          .upload(filePath, decode(base64), {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/jpeg",
          });

        if (error) {
          throw new Error(error.message);
        }

        // Una vez subida la foto, crear url firmada para ponerla en el campo img_url de la
        // tabla "publications"
        const { data: urlData, error: urlError } = await supabase.storage
          .from("publication_images")
          .createSignedUrl(data.path, 60 * 60 * 24 * 7);

        pub.img_url = urlData.signedUrl;
      } catch (uploadError) {
        Alert.alert("Error", "Ha habido un error subiendo la imagen.");
        return;
      }
    }

    // Si hay título y contenido, mandar publicación
    if (title !== "" && content !== "") {
      try {
        await submitPub(pub);
        subCtx.setUpdate(true);
        Alert.alert("Éxito", "Su publicación se ha enviado.");
        router.replace(`s/${sub}/`); // Redireccionar al subforo anterior
      } catch (error) {
        Alert.alert("Error", "Ha habido un error al subir su publicación.");
      }
    } else {
      Alert.alert("Error", "Título y contenido obligatorio");
    }
  };

  // Quitar la imágen
  const removeImage = () => {
    setImageUri(null);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white h-full pb-4">
        <View className="flex-1 px-2">
          <Text className="text-3xl font-bold mb-2">Crear una publicación</Text>
          <View className="border border-gray-500 rounded-xl mb-2">
            <TextInput
              className="text-xl ml-3"
              placeholder="Título"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View className="border border-gray-500 rounded-xl mb-2">
            <TextInput
              className="h-40 text-xl ml-3"
              placeholder="Contenido"
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          {imageUri && (
            <View className="flex-1 items-center">
              <Image
                source={{ uri: imageUri }}
                style={{ width: 150, height: 150, borderRadius: 8 }}
              />
              <TouchableOpacity
                className="mt-3 border-2 rounded-full border-[#cc1111] p-3"
                onPress={removeImage}
              >
                <Feather name="trash-2" size={26} color={"#c11"} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={handleImagePick}
            className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center"
          >
            <Text className="text-xl font-bold text-white">Subir imagen</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto mx-3">
          <TouchableOpacity
            onPress={handleSubmit}
            className="rounded-xl my-2 p-4 bg-green-500 flex justify-center items-center"
          >
            <Text className="text-xl font-bold text-white">Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
