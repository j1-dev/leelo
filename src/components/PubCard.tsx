import { Text, View, TouchableOpacity } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { Publication } from "@/lib/utils/types";
import { usePub } from "@/lib/context/Pub";
import { useState, useEffect, useCallback } from "react";
import {
  votePublication,
  fetchPublicationVote,
  fetchPub,
  relativeTime,
} from "@/lib/utils/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSub } from "@/lib/context/Sub";

interface PubCardProps {
  pub: Publication;
  sub: string;
  accent: string;
}

export default function PubCard({ pub, sub, accent }: PubCardProps) {
  const router = useRouter();
  const pubCtx = usePub();
  const subCtx = useSub();
  const { updatePublication, setUpdate } = useSub();
  const [localScore, setLocalScore] = useState(pub.score); // Estado local para la puntuación
  const [currentVote, setCurrentVote] = useState<number | null>(null); // Estado para la votación actual (1: upvote, -1: downvote)

  // useFocusEffect se ejecuta cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      const getScore = async () => {
        const pubData = await fetchPub(pub.id); // Obtiene la publicación para obtener la puntuación actual
        setLocalScore(pubData.score); // Actualiza la puntuación local
      };
      const getVote = () => {
        fetchPublicationVote(pub.id, pub.user_id).then(
          (res) => setCurrentVote(res?.vote || null), // Obtiene el voto actual del usuario
        );
      };
      getScore();
      getVote();
    }, []), // Solo se ejecuta una vez cuando la vista recibe foco
  );

  // Maneja el proceso de votar
  const handleVote = async (vote: number) => {
    let newScore = localScore;

    if (currentVote === vote) {
      newScore -= vote; // Si el usuario deshace su voto, resta el valor
      setCurrentVote(null); // Voto deshecho
    } else {
      if (currentVote !== null) {
        newScore += vote * 2; // Cambiar voto (revertir el anterior y agregar el nuevo)
      } else {
        newScore += vote; // Primer voto
      }
      setCurrentVote(vote); // Actualiza el voto actual
    }

    setLocalScore(newScore); // Actualiza la puntuación local de la publicación

    try {
      setUpdate(true); // Indica que se debe actualizar la publicación
      updatePublication(pub.id, { score: newScore }); // Actualiza la publicación con la nueva puntuación
      await votePublication(pub.user_id, pub.id, vote); // Llama a la API para registrar el voto
    } catch (error) {
      // Si hay un error, revierte la actualización optimista
      console.error("Error votando publicación:", error);
      setLocalScore(pub.score); // Revertir la puntuación local
      setCurrentVote(null); // Revertir el estado de votación
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        pubCtx.setPubId(pub.id); // Establece el id de la publicación en el contexto
        subCtx.setSubId(sub); // Establece el id del subforo en el contexto
        router.push(`/s/${sub}/p/${pub.id}`); // Navega a la página de la publicación
      }}
      className="bg-white p-4 border rounded-xl "
      style={{ borderColor: accent }} // Establece el color del borde basado en el color de acento
    >
      <View>
        <Text className="text-xl font-bold text-gray-800 w-4/5">
          {pub.title}
        </Text>
        <Text className="text-sm text-gray-500">
          {relativeTime(new Date(pub.created_at).toISOString())}{" "}
          {/* Muestra la fecha relativa */}
        </Text>
      </View>
      <View className="absolute right-4 top-6">
        <View className="flex-row">
          {/* Botón de upvote */}
          <TouchableOpacity onPress={() => handleVote(1)}>
            <AntDesign
              name="arrowup"
              className="mr-1 mt-1"
              size={18}
              color={currentVote === 1 ? "green" : "gray"} // Colorea el ícono según el voto
            />
          </TouchableOpacity>

          {/* Muestra la puntuación */}
          <Text className="text-lg font-bold mx-1">{localScore}</Text>

          {/* Botón de downvote */}
          <TouchableOpacity onPress={() => handleVote(-1)}>
            <AntDesign
              name="arrowdown"
              className="ml-1 mt-1"
              size={18}
              color={currentVote === -1 ? "red" : "gray"} // Colorea el ícono según el voto
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
