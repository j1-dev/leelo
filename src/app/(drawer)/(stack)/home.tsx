import { fetchFollowedPubs } from "@/lib/utils/api";
import { useAuth } from "@/lib/context/Auth";
import { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  RefreshControl,
} from "react-native";
import PubCard from "@/components/PubCard";

export default function Home() {
  const [pubs, setPubs] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user, loading } = useAuth();

  // Efecto que se ejecuta al montar el componente, cargando las publicaciones seguidas
  useEffect(() => {
    getPubs();
  }, []);

  // Función para obtener las publicaciones seguidas por el usuario
  const getPubs = () => {
    fetchFollowedPubs(user.id).then((res) => {
      setPubs(res); // Guarda las publicaciones obtenidas en el estado
    });
  };

  // Función para manejar el evento de refresco, vuelve a obtener las publicaciones
  const onRefresh = () => {
    setRefreshing(true); // Activa el estado de refresco
    getPubs(); // Vuelve a llamar a la API para obtener las publicaciones
  };

  // Si el estado de carga es verdadero, muestra un indicador de actividad
  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white flex h-screen relative">
      <FlatList
        data={pubs} // Lista de publicaciones a mostrar
        keyExtractor={(item) => item.pub.id}
        renderItem={({ item }) => (
          <View className="p-2">
            <PubCard
              pub={item.pub}
              sub={item.pub.sub_id}
              accent={item.accent}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Control de refresco
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">
            No hay publicaciones disponibles.
          </Text>
        }
      />
    </View>
  );
}
