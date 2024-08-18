import React from "react";
import {
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button } from "@rneui/themed";

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonText?: string;
}

export default function CommentBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Write a comment...",
  buttonText = "Send",
}: CommentInputProps) {
  return (
    <KeyboardAvoidingView
      className="bottom-0 absolute w-full p-4 bg-white rounded-lg h-28"
      keyboardVerticalOffset={160}
      behavior={Platform.OS === "ios" ? "position" : undefined}
    >
      <TextInput
        className="p-2 bg-white rounded-lg border border-gray-300 h-14 w-[80%]"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      <View
        className={`absolute ${
          Platform.OS === "ios" ? "top-[6px] right-0" : "right-3 top-5"
        }`}
      >
        <Button
          title={buttonText}
          onPress={onSubmit}
          buttonStyle={{ backgroundColor: "#2196F3" }}
          containerStyle={{ borderRadius: 8 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
