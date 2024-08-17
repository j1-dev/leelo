import React from "react";
import { View, TextInput, Platform } from "react-native";
import { Button } from "@rneui/themed";
import { InputAccessoryView } from "react-native";

const CommentBar = ({
  value,
  onChangeText,
  onPress,
  placeholder = "Write a comment...",
  buttonTitle = "Send",
  buttonColor = "#2196F3",
}) => {
  const inputComponent = (
    <View className="absolute bottom-0 w-full bg-white z-50 p-3 border-t-[1px] border-gray-300">
      <View className="w-full h-full bg-white relative">
        <TextInput
          className="p-2 bg-white rounded-lg border border-gray-300 h-14 w-5/6 left-0"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
        <View className="top-1 right-0 absolute">
          <Button
            title={buttonTitle}
            onPress={onPress}
            buttonStyle={{ backgroundColor: buttonColor }}
            containerStyle={{ borderRadius: 8 }}
          />
        </View>
      </View>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <InputAccessoryView className="z-50">{inputComponent}</InputAccessoryView>
    );
  } else {
    return inputComponent;
  }
};

export default CommentBar;
