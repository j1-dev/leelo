import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Link, Stack, useRouter } from "expo-router";
import {
  deleteComment,
  fetchComment,
  relativeTime,
  submitComment,
} from "@/lib/utils/api";
import { Comment, Subforum } from "@/lib/utils/types";
import { useAuth } from "@/lib/context/Auth";
import { usePub } from "@/lib/context/Pub";
import { useSub } from "@/lib/context/Sub";
import { renderComments } from "@/components/CommentRenderer";
import { SafeAreaView } from "react-native";
import CommentBar from "@/components/CommentBar";
import Feather from "@expo/vector-icons/Feather";

export default function Comm() {
  const pubCtx = usePub();
  const subCtx = useSub();
  const router = useRouter();
  const { comm, sub, pub } = useLocalSearchParams();
  const { user, loading } = useAuth();
  const [commentHeight, setCommentHeight] = useState();
  const [comment, setComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const commentRef = useRef();

  useEffect(() => {
    // Cargar comentario y respuesta
    const loadCommentAndReplies = async () => {
      try {
        // Cargar comentario actual
        const commentData = await fetchComment(comm as string);
        setComment(commentData);

        // Cargar comentario padre si lo tiene
        if (!!commentData.parent_comment) {
          const parentData = await fetchComment(commentData.parent_comment);
          setParentComment(parentData);
        } else {
          setParentComment(null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadCommentAndReplies();
    setLoading(false);
  }, [comm, pub]);

  // Función para enviar el comentario
  const handleReplySubmit = async () => {
    if (newReply.trim().length === 0) {
      Alert.alert("Error", "La respuesta no puede estar vacía");
      return;
    }
    try {
      await submitComment(user.id, pub as string, newReply, comm as string);
      setNewReply(""); // Resetear la caja de comentario
      pubCtx.setUpdate(true); // Actualizar el contexto de la publicación
    } catch (error) {
      console.error("Error enviando respuesta:", error);
    }
  };

  // Función para actualizar la altura del layout del comentario. Solo es útil
  // para IOS
  const handleCommentLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setCommentHeight(height);
  };

  // Función para borrar comentario
  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      "Confiramr borrado",
      "¿Está seguro de que quiere borrar este comentario? Esta acción no se podrá deshacer",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => {
            deleteComment(commentId);
            // Borrar comentario de la colección local del contexto de la publicación
            pubCtx.setComments((prevComments) =>
              prevComments.filter((comment) => comment.id !== commentId),
            );
            router.back();
          },
        },
      ],
    );
  };

  // Si está cargando mostrar un spinner
  if (loading || isLoading) {
    return <ActivityIndicator size={90} color="#0000ff" className="mt-60" />;
  }

  return (
    <View className="bg-white relative h-full">
      {pubCtx.title.length <= 23 ? (
        <Stack.Screen
          options={{
            headerTitle: pubCtx.title,
          }}
        />
      ) : (
        <Stack.Screen
          options={{
            headerTitle: pubCtx.title.slice(0, 23) + "...",
          }}
        />
      )}
      <View ref={commentRef} onLayout={handleCommentLayout}>
        {parentComment && (
          <Link href={`s/${sub}/p/${pub}/c/${parentComment.id}`}>
            <View className="mb-4 p-4 bg-white rounded-lg">
              <Text className="text-lg font-bold">{parentComment.content}</Text>
              <Text className="text-xs text-gray-500 mt-2">
                {relativeTime(new Date(parentComment.created_at).toISOString())}
              </Text>
            </View>
          </Link>
        )}
        {comment && (
          <View
            className="mt-4 p-4 w-full bg-white border-b-[1px]"
            style={{ borderColor: subCtx.accent }}
          >
            <TouchableOpacity
              onPress={() => router.push(`s/${sub}/p/${pub}/c/${comment.id}`)}
            >
              <View className="border relative border-white">
                <Text className="text-2xl font-bold w-4/5">
                  {comment.content}
                </Text>
                <Text className="text-xs text-gray-500 mt-2">
                  {relativeTime(new Date(comment.created_at).toISOString())}
                </Text>
                {/* Solo enseñar bottón de borrar si es el creador o es moderador del sub */}
                {user.id === comment.user_id ||
                subCtx?.mods?.includes(user.id) ? (
                  <TouchableOpacity
                    className="absolute right-[31px] top-3"
                    onPress={() => handleDeleteComment(comment.id)}
                  >
                    <Feather name="trash-2" size={26} color={"#c11"} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <SafeAreaView className="h-screen flex-1 bg-white">
        {/* Renderizado recursivo de comentarios */}
        {pubCtx.comments
          ? renderComments(
              pubCtx.comments,
              comm as string,
              sub as string,
              pub as string,
              3,
              0,
              subCtx.accent,
            )
          : null}
        {/* Barra para comentar */}
        <CommentBar
          value={newReply}
          onChangeText={setNewReply}
          onSubmit={handleReplySubmit}
          commentId={comm as string}
          pubHeight={commentHeight}
        />
      </SafeAreaView>
    </View>
  );
}
