import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import CommentCard from "@/components/CommentCard";
import { Comment } from "@/lib/utils/types";
import { Link } from "expo-router";
import { getShadesOfAccent } from "@/lib/utils/colors";

// Función para calcular el color del borde basado en el color de acento y la profundidad
const borderColor = (accent: string, depth: number): string => {
  const { lightShade, darkShade } = getShadesOfAccent(accent);
  // Alterna entre tonos claros y oscuros según si la profundidad es par o impar
  if (depth % 2 === 0) {
    return lightShade;
  } else {
    return darkShade;
  }
};

// Función que renderiza los comentarios de manera recursiva
export const renderComments = (
  commentList: Comment[],
  parentId: string | null = null,
  sub: string,
  pub: string,
  maxDepth: number,
  currentDepth: number = 0,
  accent: string,
) => {
  // Función para verificar si un comentario es el último en la lista
  const isLastComment = (item: Comment, commentList: Comment[]): boolean => {
    return item === commentList[commentList.length - 1];
  };

  // Filtra los comentarios que tienen el parentId correspondiente
  const filteredList = commentList.filter(
    (comment) => comment.parent_comment === parentId,
  );

  return (
    <FlatList
      data={filteredList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          className={`${currentDepth !== 0 ? "border-l-[1px]" : " "} ${
            isLastComment(item, filteredList) ? "rounded-bl-2xl" : " "
          } pl-4 pt-4 bg-white`}
          style={{ borderColor: borderColor(accent, currentDepth) }} // Aplica el color del borde según el color de acento y la profundidad
        >
          <CommentCard
            sub={sub}
            pub={pub}
            item={item}
            depth={currentDepth}
            accent={accent}
            isLastThreadComment={
              currentDepth === maxDepth || // Verifica si es el último comentario en la profundidad máxima
              commentList.filter((c) => c.parent_comment === item.id).length ===
                0 // Si no hay más comentarios hijos, se marca como último
            }
          />
          {currentDepth < maxDepth ? (
            // Si la profundidad actual es menor que la máxima, renderiza los comentarios hijos de forma recursiva
            renderComments(
              commentList,
              item.id,
              sub,
              pub,
              maxDepth,
              currentDepth + 1,
              accent,
            )
          ) : (
            <TouchableOpacity className="ml-4 mt-2">
              <Link
                href={`s/${sub}/p/${pub}/c/${parentId}`} // Enlace para ver más comentarios
                className="text-blue-500 underline"
              >
                <Text>Mostrar más comentarios</Text>
              </Link>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};
