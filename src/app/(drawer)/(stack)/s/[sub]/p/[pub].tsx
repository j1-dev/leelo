import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Publication } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import {
  fetchPub,
  submitComment,
  deletePub,
  votePublication,
  fetchPublicationVote,
  relativeTime,
} from "@/lib/utils/api";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { usePub } from "@/lib/context/Pub";
import { renderComments } from "@/components/CommentRenderer";
import { useSub } from "@/lib/context/Sub";
import { SafeAreaView } from "react-native";
import CommentBar from "@/components/CommentBar";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

export default function Pub() {
  const pubCtx = usePub();
  const subCtx = useSub();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [newComment, setNewComment] = useState("");
  const [localScore, setLocalScore] = useState(0);
  const [currentVote, setCurrentVote] = useState<number | null>(null);
  const { user, loading, setLoading } = useAuth();
  const { sub, pub } = useLocalSearchParams();
  const [publicationHeight, setPublicationHeight] = useState(0);
  const commentRef = useRef();
  const router = useRouter();

  useEffect(() => {
    // Cargar publicación y comentarios
    const loadPubAndComments = async () => {
      try {
        // Pasar id de la publicación al contexto
        pubCtx.setPubId(pub);
        const pubData = await fetchPub(pub as string);
        setPublication(pubData);
        setLocalScore(pubData.score);
      } catch (error) {
        console.error(error);
      }
    };
    // Cargar sentido del voto si existe
    const getVote = () => {
      fetchPublicationVote(pubCtx.pubId, pubCtx.userId).then((res) =>
        setCurrentVote(res?.vote || null),
      );
    };
    setLoading(true);
    getVote();
    loadPubAndComments();
    setLoading(false);
  }, []);

  // Función para actualizar la altura del layout de la publicación.
  const handlePublicationLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setPublicationHeight(height);
  };

  // Función para manejar el voto en el front-end
  const handleVote = async (vote: number) => {
    // Guardar puntuación
    let newScore = localScore;

    if (currentVote === vote) {
      // Si el usuario deshace el voto, restarlo de la puntuación
      newScore -= vote;
      setCurrentVote(null);
    } else {
      // El usuario está votando por primera vez o cambiando el sentido del voto
      if (currentVote !== null) {
        // Si ya hay voto, revertir el sentido
        newScore += vote * 2;
      } else {
        // Primera vez votando, añadir el voto
        newScore += vote;
      }
      setCurrentVote(vote);
    }

    setLocalScore(newScore);

    // Llamar a la api para actualizar la puntuación el el back-end
    try {
      subCtx.setUpdate(true);
      subCtx.updatePublication(publication.id, { score: newScore });
      await votePublication(publication.user_id, publication.id, vote);
    } catch (error) {
      // Si hay un error, revertir la operación
      console.error("Error al votar el comentario:", error);
      setLocalScore(publication.score);
      setCurrentVote(null);
    }
  };

  // Función para enviar el comentario
  const handleCommentSubmit = async () => {
    if (newComment.trim().length === 0) {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    try {
      await submitComment(user.id, pub as string, newComment);
      setNewComment(""); // Resetear la caja de comentario
      pubCtx.setUpdate(true); // Actualizar el contexto de la publicación
    } catch (error) {
      Alert.alert("Error", "Error al enviar el comentario");
    }
  };

  // Función para borrar publicación
  const handleDeletePub = (pubId: string) => {
    Alert.alert(
      "Confirmar borrado",
      "¿Está seguro de que quiere borrar esta publicación? Esta acción no se podrá deshacer",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => {
            deletePub(pubId);
            // Borrar publicación de la colección local del contexto del subforo
            subCtx.setPubs((prevPubs) =>
              prevPubs.filter((pub) => pub.id !== pubId),
            );
            // subCtx.setUpdate(true);
            router.back();
          },
        },
      ],
    );
  };

  if (loading || !publication)
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;

  return (
    <View className="relative h-full bg-white">
      <Stack.Screen
        options={{
          headerTitle:
            pubCtx.title.length <= 23
              ? pubCtx.title
              : pubCtx.title.slice(0, 23) + "...",
        }}
      />

      {publication && (
        <View
          className={`w-full p-4 bg-white border-b-[1px]`}
          style={{ borderColor: subCtx.accent }}
          ref={commentRef}
          onLayout={handlePublicationLayout}
        >
          <ScrollView className="border relative border-white">
            <Text className="text-2xl font-bold w-4/5">
              {publication.title}
            </Text>
            <Text className="text-base mt-2 w-4/5">{publication.content}</Text>
            <Text className="text-xs text-gray-500 mt-2">
              {relativeTime(new Date(publication.created_at).toISOString())}
            </Text>
            {!!publication.img_url && (
              <View className="flex-1 items-center mt-3">
                <Image
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "cover",
                    borderRadius: 25,
                  }}
                  src={publication.img_url}
                />
              </View>
            )}
            {/* Solo enseñar bottón de borrar si es el creador o es moderador del sub */}
            {user.id === publication.user_id ||
            subCtx?.mods?.includes(user.id) ? (
              <TouchableOpacity
                className="absolute right-[31px] top-10"
                onPress={() => handleDeletePub(publication.id)}
              >
                <Feather name="trash-2" size={26} color={"#c11"} />
              </TouchableOpacity>
            ) : null}
            <View className="absolute right-4 top-0">
              <View className="flex-row">
                {/* Voto positivo */}
                <TouchableOpacity onPress={() => handleVote(1)}>
                  <AntDesign
                    name="arrowup"
                    className="mr-1 mt-1"
                    size={18}
                    color={currentVote === 1 ? "green" : "gray"}
                  />
                </TouchableOpacity>

                {/* Puntuación */}
                <Text className="text-lg font-bold mx-1">{localScore}</Text>

                {/* Voto negativo */}
                <TouchableOpacity onPress={() => handleVote(-1)}>
                  <AntDesign
                    name="arrowdown"
                    className="ml-1 mt-1"
                    size={18}
                    color={currentVote === -1 ? "red" : "gray"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
      <SafeAreaView className="h-screen flex-1 bg-white">
        {/* Renderizado recursivo de comentarios */}
        {pubCtx.comments
          ? renderComments(
              pubCtx.comments,
              null,
              sub as string,
              pub as string,
              3,
              0,
              subCtx.accent ? subCtx.accent : "00FF00",
            )
          : null}
        {/* Barra para comentar */}
        <CommentBar
          value={newComment}
          onChangeText={setNewComment}
          onSubmit={handleCommentSubmit}
          pubHeight={publicationHeight}
        />
      </SafeAreaView>
    </View>
  );
}
