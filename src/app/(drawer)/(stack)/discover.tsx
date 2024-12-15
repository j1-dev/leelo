import SubRenderer from '@/components/SubRenderer';
import { fetchSubs } from '@/lib/utils/api';
import { useAuth } from '@/lib/context/Auth';
import { Subforum } from '@/lib/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function Home() {
  // Estado local para almacenar la lista de subforos
  const [subs, setSubs] = useState<Subforum[]>([]);

  // Obtenemos el estado de carga desde el contexto de autenticación
  const { loading } = useAuth();

  // Efecto para obtener la lista de subforos al mostrar el componente
  useFocusEffect(
    useCallback(() => {
      getSubs();
    }, [])
  );

  // Función para obtener la lista de subforos desde la API
  const getSubs = () => {
    fetchSubs()
      .then((data: Subforum[]) => {
        setSubs([...data]);
      })
      .catch((e) => {
        throw e;
      });
  };

  if (loading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white flex h-screen relative">
      {/* SubRenderer se encarga de mostrar la lista de subforos. También recibe una función onReload que recarga los datos */}
      <SubRenderer subList={subs} onReload={() => getSubs()} />
    </View>
  );
}
