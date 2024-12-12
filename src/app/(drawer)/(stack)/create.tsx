import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { Subforum } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { router } from "expo-router";
import { submitSub, fetchUsers } from "@/lib/utils/api";
import ColorPicker from "react-native-wheel-color-picker";
import { Ionicons } from "@expo/vector-icons"; // Importing Expo Vector Icons
import { supabase } from "@/lib/utils/supabase";

export default function CreateSub() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#ff0000");
  const [moderators, setModerators] = useState<string[]>([]); // Selected moderators
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search term
  const [users, setUsers] = useState([]); // Available users for selection
  const { user } = useAuth();

  const handleSubmit = async () => {
    const sub: Subforum = {
      name,
      description,
      created_at: new Date().toISOString(),
      accent,
      created_by: user.id,
    };
    try {
      submitSub(sub).then(async (data) => {
        const subId = data.id;
        const moderatorIds = moderators.map((username) => {
          const user = users.find((user) => user.username === username);
          return user.id;
        });

        if (moderatorIds.length > 0) {
          const moderatorsData = moderatorIds.map((user_id) => ({
            sub_id: subId,
            user_id: user_id,
          }));

          const { error: moderatorsError } = await supabase
            .from("moderators")
            .insert(moderatorsData);

          if (moderatorsError) {
            console.error(
              "Error inserting moderators:",
              moderatorsError.message,
            );
            Alert.alert("Error", "There was an issue adding moderators.");
            return;
          }
        }

        Alert.alert(
          "Success",
          "Your subforum has been created and moderators added!",
        );
        router.push(`/home`); // Redirect to the desired page after submission
      });
      // Redirect to the desired page after submission
    } catch (error) {
      console.error("Error submitting subforum:", error.message);
      Alert.alert("Error", "There was an issue submitting your sub.");
    }
  };

  const handleAddMods = () => {
    setModalVisible(true); // Show the modal
    fetchAvailableUsers(); // Load users when modal opens
  };

  const fetchAvailableUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      Alert.alert("Error", "Unable to fetch users.");
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredUsers = users.filter((u: any) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addModerator = (username: string) => {
    if (!moderators.includes(username)) {
      setModerators((prev) => [...prev, username]);
    }
  };

  const removeModerator = (username: string) => {
    setModerators((prev) => prev.filter((mod) => mod !== username));
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white h-full pb-4">
        <View className="flex-1 px-4 ">
          <Text className="text-3xl font-bold mb-4">Create a New Subforum</Text>
          <TextInput
            className="border border-gray-300 p-3 mb-4 rounded"
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="border border-gray-300 p-3 mb-4 rounded h-40 text-gray-800"
            placeholder="Content"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View className="px-6">
            <ColorPicker
              color={accent}
              onColorChange={(color) => {
                console.log(color);
                setAccent(color);
              }}
              thumbSize={50}
              swatchesOnly={true}
              swatchesLast={true}
              sliderSize={30}
              noSnap={true}
              swatches={true}
              row={false}
            />
            <View className="flex-1 items-center">
              <View
                className={`w-20 h-20 mt-10 rounded-lg`}
                style={{ backgroundColor: accent }}
              />
            </View>
          </View>
        </View>

        {/* Display selected moderators */}
        <View className="mx-4">
          {moderators.length > 0 && (
            <View className="bg-gray-100 p-3 rounded mb-4">
              <Text className="font-bold mb-2">Selected Moderators:</Text>
              {moderators.map((mod, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center mb-2"
                >
                  <Text className="text-lg">{mod}</Text>
                  <TouchableOpacity onPress={() => removeModerator(mod)}>
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color="red"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Buttons */}
        <View className="mt-auto mx-4 mb-20">
          <TouchableOpacity
            onPress={handleAddMods}
            className="rounded-xl my-2 p-4 bg-blue-500 flex justify-center items-center"
          >
            <Text className="text-xl font-bold text-white">
              Add Moderator/s
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            className="rounded-xl my-2 p-4 bg-green-500 flex justify-center items-center"
          >
            <Text className="text-xl font-bold text-white">Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for adding moderators */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-white p-4">
            <TextInput
              className="border border-gray-300 p-3 mb-4 rounded"
              placeholder="Search Users"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="flex-row justify-between items-center border-b border-gray-200 p-3">
                  <Text className="text-lg">{item.username}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      moderators.includes(item.username)
                        ? removeModerator(item.username)
                        : addModerator(item.username)
                    }
                  >
                    <Ionicons
                      name={
                        moderators.includes(item.username)
                          ? "remove-circle-outline"
                          : "add-circle-outline"
                      }
                      size={24}
                      color={
                        moderators.includes(item.username) ? "red" : "blue"
                      }
                    />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text className="text-gray-500 text-center mt-4">
                  No users found.
                </Text>
              }
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-4 p-4 rounded-xl bg-red-500 flex items-center"
            >
              <Text className="text-white font-bold text-lg">Done</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
