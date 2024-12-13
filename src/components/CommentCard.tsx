import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Comment } from "@/lib/utils/types";
import { getShadesOfAccent } from "@/lib/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  fetchCommentVote,
  fetchUserName,
  relativeTime,
  voteComment,
} from "@/lib/utils/api";
import { usePub } from "@/lib/context/Pub";
import { useState, useEffect } from "react";

interface CommentCardProps {
  sub: string;
  pub: string;
  depth: number;
  item: Comment;
  accent: string;
  isLastThreadComment: boolean;
}

// Función para calcular el color del borde en función de la profundidad y el color de acento
const borderColor = (accent: string, depth: number): string => {
  const { lightShade, darkShade } = getShadesOfAccent(accent);
  return depth % 2 !== 0 ? lightShade : darkShade; // Alterna entre tonos claros y oscuros
};

export default function CommentCard({
  sub,
  pub,
  depth,
  item,
  accent,
  isLastThreadComment,
}: CommentCardProps) {
  const { updateComment } = usePub(); // Contexto para actualizar la puntuación del comentario

  const [localScore, setLocalScore] = useState<number>(item.score);
  const [currentVote, setCurrentVote] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getVote = () => {
      // Obtener el voto actual del comentario
      fetchCommentVote(item.id, item.user_id).then((res) =>
        setCurrentVote(res?.vote || null),
      );
    };

    const getUserName = () => {
      // Obtener el nombre de usuario asociado al comentario
      fetchUserName(item.user_id).then((res) => {
        setUserName(res);
      });
    };

    getVote();
    getUserName();
  }, []);

  const handleVote = async (vote: number) => {
    let newScore = localScore;

    if (currentVote === vote) {
      // Si el usuario está deshaciendo su voto, restarlo
      newScore -= vote;
      setCurrentVote(null);
    } else {
      if (currentVote !== null) {
        // Si el usuario ya había votado, revertir el voto anterior y aplicar el nuevo
        newScore += vote * 2;
      } else {
        // Primer voto, simplemente añadir el voto
        newScore += vote;
      }
      setCurrentVote(vote);
    }

    setLocalScore(newScore);

    // Llamada a la API para actualizar la puntuación
    try {
      updateComment(item.id, { score: newScore });
      await voteComment(item.user_id, item.id, vote);
    } catch (error) {
      // Si hay un error, revertir el cambio optimista
      console.error("Error votando comentario:", error);
      setLocalScore(item.score); // Volver a la puntuación original
      setCurrentVote(null); // Restablecer el estado del voto
    }
  };

  return (
    <View
      className={`pl-4 pr-3 pt-2 pb-2 bg-white rounded-tl-2xl ${
        isLastThreadComment ? "rounded-bl-2xl" : ""
      } border-t-[1px] border-l-[1px] w-full`}
      style={{ borderColor: borderColor(accent, depth) }} // Ajuste del color del borde según la profundidad y el color de acento
    >
      <TouchableOpacity
        onPress={() => {
          // Navegar a la página de detalle del comentario
          router.push(`s/${sub}/p/${pub}/c/${item.id}`);
        }}
      >
        <View className="relative">
          <Text className="text-sm text-gray-500 underline mb-1">
            {userName} {/* Mostrar el nombre de usuario */}
          </Text>
          <Text className="text-base text-gray-800 mb-1 w-[80%]">
            {item.content} {/* Mostrar el contenido del comentario */}
          </Text>
          <Text className="text-xs text-gray-500">
            {relativeTime(new Date(item.created_at).toISOString())}{" "}
            {/* Mostrar la fecha del comentario en formato relativo */}
          </Text>
          <View className="absolute right-3 top-3">
            <View className="flex-row">
              {/* Botón de voto positivo */}
              <TouchableOpacity onPress={() => handleVote(1)}>
                <AntDesign
                  name="arrowup"
                  className="mr-1 mt-1"
                  size={18}
                  color={currentVote === 1 ? "green" : "gray"} // Resaltar si se ha votado positivo
                />
              </TouchableOpacity>

              {/* Mostrar la puntuación */}
              <Text className="text-lg font-bold mx-1">{localScore}</Text>

              {/* Botón de voto negativo */}
              <TouchableOpacity onPress={() => handleVote(-1)}>
                <AntDesign
                  name="arrowdown"
                  className="ml-1 mt-1"
                  size={18}
                  color={currentVote === -1 ? "red" : "gray"} // Resaltar si se ha votado negativo
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
