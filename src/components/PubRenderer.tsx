import React, { useState } from "react";
import { FlatList, View, Text, RefreshControl } from "react-native";
import { Publication } from "@/lib/utils/types";
import PubCard from "./PubCard"; // Ajusta la ruta de importación según la estructura de tu proyecto

// Función para renderizar la lista de publicaciones
export const renderPubs = (
  pubList: Publication[],
  accent: string,
  onRefresh: () => void,
) => {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <FlatList
      data={pubList} // Lista de publicaciones que se va a mostrar
      keyExtractor={(item) => item.id} // Define la clave única para cada item, en este caso el id de la publicación
      renderItem={({ item }) => (
        <View className="p-1">
          {/* Renderiza cada publicación usando el componente PubCard */}
          <PubCard pub={item} sub={item.sub_id} accent={accent} />
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Control de refresco
      }
      ListEmptyComponent={
        // Mensaje que se muestra cuando no hay publicaciones en la lista
        <Text className="text-center text-gray-500 mt-4">
          No hay publicaciones disponibles.
        </Text>
      }
    />
  );
};
