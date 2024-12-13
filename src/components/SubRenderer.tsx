import React from "react";
import { FlatList, View, Text } from "react-native";
import { Subforum } from "@/lib/utils/types";
import SubCard from "@/components/SubCard";
import { useAuth } from "@/lib/context/Auth";
import { useEffect, useState } from "react";
import { fetchFollowedSubs } from "@/lib/utils/api";
import { RefreshControl } from "react-native";

interface SubRendererProps {
  subList: Subforum[];
  onReload?: () => void;
}

export default function SubRenderer({ subList, onReload }: SubRendererProps) {
  const { user } = useAuth();
  const [follows, setFollows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Llama a la función que obtiene los subforos seguidos por el usuario
    fetchFollowedSubs(user.id)
      .then((data) => {
        // Mapea los datos para obtener solo los IDs de los subforos seguidos
        setFollows(data.map((item) => item.sub_id));
      })
      .catch((e) => {
        throw e; // Lanza un error si ocurre un problema
      });
  }, []); // Se ejecuta solo una vez cuando el componente se monta

  const onRefresh = async () => {
    onReload();
  };

  return (
    <FlatList
      className="h-full bg-white"
      data={subList} // La lista de subforos a mostrar
      keyExtractor={(item) => item.id} // Asegura que cada subforo tenga una clave única
      renderItem={({ item }) => (
        <View className="p-2">
          <SubCard
            subforum={item} // Pasa el subforo actual al componente SubCard
            userFollows={follows.includes(item.id)} // Verifica si el usuario sigue este subforo
            userId={user.id} // Pasa el ID del usuario al componente SubCard
            key={Math.random()} // Asigna una clave única para evitar problemas con el renderizado
          />
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Permite hacer pull-to-refresh para recargar los datos
      }
      ListEmptyComponent={
        <Text className="text-center text-gray-500 mt-4">
          No hay subforos disponibles.{" "}
          {/* Muestra un mensaje si no hay subforos */}
        </Text>
      }
    />
  );
}
