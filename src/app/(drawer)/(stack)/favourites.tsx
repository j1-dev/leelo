import { fetchFavoritedPubs } from "@/lib/utils/api"; // Asegúrate de tener esta función API para obtener las publicaciones votadas positivamente
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

export default function Favourites() {
  const [pubs, setPubs] = useState(null); // Estado para guardar las publicaciones votadas positivamente
  const [refreshing, setRefreshing] = useState(false); // Estado para controlar la lógica de refresco
  const { user, loading } = useAuth();

  // Efecto que se ejecuta cuando el componente se monta para obtener las publicaciones con votos positivos
  useEffect(() => {
    getFavoritedPubs();
  }, []);

  // Función para obtener las publicaciones que tienen votos positivos
  const getFavoritedPubs = () => {
    fetchFavoritedPubs(user.id).then((res) => {
      setPubs(res); // Guardamos las publicaciones obtenidas en el estado
    });
  };

  // Función para manejar el evento de refresco
  const onRefresh = () => {
    setRefreshing(true); // Activamos el estado de refresco
    getFavoritedPubs(); // Volvemos a obtener las publicaciones
  };

  // Si el estado de carga es verdadero, mostramos un indicador de actividad
  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white flex h-screen relative">
      <FlatList
        data={pubs} // Lista de publicaciones a mostrar
        keyExtractor={(item) => item.pub.id} // Clave única para cada publicación
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Control de refresco para la lista
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">
            No hay publicaciones favoritas.
          </Text>
        }
      />
    </View>
  );
}
