import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Subforum } from '@/lib/utils/types';
import { useSub } from '@/lib/context/Sub';
import { TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { followSub, unfollowSub } from '@/lib/utils/api';
import Feather from '@expo/vector-icons/Feather';

interface SubCardProps {
  subforum: Subforum;
  userFollows: boolean;
  userId: string;
}

export default function SubCard({
  subforum,
  userFollows,
  userId,
}: SubCardProps) {
  const sub = useSub(); // Contexto de subforo
  const [follows, setFollows] = useState(userFollows); // Estado local para manejar el estado de seguir/subir

  // Función para alternar el estado de seguimiento
  const toggleFollow = () => {
    if (follows) {
      unfollowSub(userId, subforum.id);
    } else {
      followSub(userId, subforum.id);
    }
    // Cambia el estado local para actualizar la interfaz
    setFollows(!follows);
  };

  return (
    <View
      className="bg-white p-4 border rounded-xl h-[84px]"
      style={{ borderColor: subforum.accent }} // Color de borde personalizado basado en el subforo
    >
      <Link
        href={`/s/${subforum.id}`} // Redirige al subforo cuando se hace clic
        className="w-full flex-1 relative"
        onPress={() => sub.setSubId(subforum.id)} // Establece el ID del subforo en el contexto
      >
        <View className="w-4/5 absolute left-0">
          <Text className="text-xl font-bold text-gray-800">
            {subforum.name} {/* Muestra el nombre del subforo */}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            {subforum.description} {/* Muestra la descripción del subforo */}
          </Text>
        </View>
      </Link>
      <TouchableOpacity
        onPress={() => toggleFollow()} // Alterna el estado de seguir
        className="absolute right-5 top-7 justify-center items-end ">
        {/* Muestra un icono diferente dependiendo de si el usuario sigue o no el subforo */}
        {follows ? (
          <Feather name="user-minus" size={30} color={'#CA1200'} /> // Ícono para dejar de seguir
        ) : (
          <Feather name="user-plus" size={30} color={'#007AFF'} /> // Ícono para seguir
        )}
      </TouchableOpacity>
    </View>
  );
}
