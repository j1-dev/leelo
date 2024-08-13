import { ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/ctx";

export default function Home() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="flex h-screen relative">
      <View className="w-full h-20 shadow-lg absolute border border-black p-3">
        <Text>{user.email}</Text>
      </View>
      <ScrollView className="w-full h-full">
        {[...Array(500).keys()].map((value, index) => {
          return (
            <View key={index} className="w-full h-20 shadow-lg ">
              <Text>Ejemplo {index}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
