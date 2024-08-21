import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";
import { decode } from "base64-arraybuffer";
import { User } from "./types";

const onSelectImage = async (userId: string) => {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
  };

  const result = await ImagePicker.launchImageLibraryAsync();

  if (!result.canceled) {
    const img = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(img.uri, {
      encoding: "base64",
    });
    const filePath = `${userId}/${new Date().toISOString()}.${
      img.type === "image" ? "png" : "mp4"
    }`;
    const fileType = img.type === "image" ? "png" : "mp4";
    const { data, error } = await supabase.storage
      .from("profile_pics")
      .upload(filePath, decode(base64), {
        cacheControl: "3600",
        upsert: false,
        contentType: img.mimeType || "image/jpeg",
      });
    console.log("Data: ", data);
    console.log("Error: ", error);
  }
};
