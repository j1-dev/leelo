import { supabase } from "@/lib/utils/supabase";
import { Subforum, Publication, Comment, User } from "@/lib/utils/types";

/**
 * Obtiene el nombre de usuario de un usuario según su ID.
 * @param userId - El ID del usuario.
 * @returns El nombre de usuario del usuario.
 */
export const fetchUserName = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data.username as string;
};

/**
 * Obtiene campos específicos de un usuario según el query proporcionado.
 * @param userId - El ID del usuario.
 * @param query - Un string con los campos a consultar (por ejemplo, "username, email").
 * @returns Un objeto parcial del usuario con los campos solicitados.
 */
export const fetchUserQuery = async (
  userId: string,
  query: string,
): Promise<Partial<User>> => {
  const { data, error } = await supabase
    .from("users")
    .select(query)
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Partial<User>;
};

/**
 * Obtiene todos los datos de un usuario.
 * @param userId - El ID del usuario.
 * @returns Un objeto de usuario con todos sus campos.
 */
export const fetchUser = async (
  userId: string,
): Promise<User | Partial<User>> => {
  return await fetchUserQuery(userId, "*");
};

/**
 * Obtiene una lista de todos los usuarios.
 * @returns Un array de objetos de usuario.
 */
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
};

/**
 * Obtiene una lista de moderadores para un subforo específico.
 * @param subId - El ID del subforo.
 * @returns Una lista de IDs de usuarios que son moderadores.
 */
export const fetchModerators = async (subId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("moderators")
      .select("user_id")
      .eq("sub_id", subId);

    if (error) {
      throw new Error(`Error recuperando moderadores ${error.message}`);
    }

    return data.map((moderator) => moderator.user_id);
  } catch (error) {
    console.error("Error recuperando moderadores:", error);
    throw error;
  }
};

/**
 * Obtiene un subforo por su ID.
 * @param subId - El ID del subforo.
 * @returns Un objeto del subforo o null si no se encuentra.
 */
export const fetchSub = async (subId: string): Promise<Subforum | null> => {
  const { data, error } = await supabase
    .from("subforums")
    .select("*")
    .eq("id", subId)
    .single();
  if (error) throw error;
  return data;
};

/**
 * Obtiene una lista de todos los subforos.
 * @returns Un array de objetos de subforos.
 */
export const fetchSubs = async (): Promise<Subforum[]> => {
  const { data, error } = await supabase.from("subforums").select("*");
  if (error) throw error;
  return data;
};

/**
 * Permite a un usuario seguir un subforo específico.
 * @param userId - El ID del usuario.
 * @param subId - El ID del subforo a seguir.
 */
export const followSub = async (userId: String, subId: String) => {
  const { error } = await supabase
    .from("user_follows_subforum")
    .insert({ user_id: userId, sub_id: subId });
  if (error) throw error;
};

/**
 * Permite a un usuario dejar de seguir un subforo específico.
 * @param userId - El ID del usuario.
 * @param subId - El ID del subforo a dejar de seguir.
 */
export const unfollowSub = async (userId: String, subId: String) => {
  const { error } = await supabase
    .from("user_follows_subforum")
    .delete()
    .eq("user_id", userId)
    .eq("sub_id", subId);
  if (error) throw error;
};

/**
 * Obtiene los subforos que un usuario sigue.
 * @param userId - El ID del usuario.
 * @returns Una lista de IDs de subforos que el usuario sigue.
 */
export const fetchFollowedSubs = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_follows_subforum")
    .select("sub_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

/**
 * Elimina un subforo por su ID.
 * @param subId - El ID del subforo a eliminar.
 */
export const deleteSub = async (subId: string): Promise<void> => {
  const { error } = await supabase.from("subforums").delete().eq("id", subId);

  if (error) {
    throw new Error(`Error borrando subforo: ${error.message}`);
  }
};

/**
 * Envía un nuevo subforo a la base de datos.
 * @param sub - El objeto del subforo a crear.
 * @returns El objeto del subforo recién creado.
 */
export const submitSub = async (sub: Subforum) => {
  const { data, error } = await supabase
    .from("subforums")
    .insert([sub])
    .select("id")
    .single();
  if (error) throw error;
  return data;
};

/**
 * Obtiene una publicación por su ID.
 * @param pubId - El ID de la publicación.
 * @returns El objeto de la publicación o null si no se encuentra.
 */
export const fetchPub = async (pubId: string): Promise<Publication | null> => {
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("id", pubId)
    .single();
  if (error) throw error;
  return data;
};

/**
 * Obtiene una lista de todas las publicaciones de un subforo específico.
 * @param subId - El ID del subforo.
 * @returns Un array de objetos de publicaciones.
 */
export const fetchPubs = async (
  subId: string,
): Promise<Publication[] | null> => {
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("sub_id", subId);
  if (error) throw error;
  return data;
};

/**
 * Obtiene todas las publicaciones de los subforos que un usuario sigue.
 * @param userId - El ID del usuario.
 * @returns Una lista de publicaciones con el acento de su subforo asociado.
 */
export const fetchFollowedPubs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_follows_subforum")
      .select("sub_id")
      .eq("user_id", userId);

    if (error)
      throw new Error(`Error recuperando subforos seguidos: ${error.message}`);
    if (!data || data.length === 0) return []; // No followed subforums

    const subforumIds = data.map((follow) => follow.sub_id);

    const { data: publications, error: pubsError } = await supabase
      .from("publications")
      .select(
        `
        *,
        subforums(accent)
      `,
      )
      .in("sub_id", subforumIds)
      .order("created_at", { ascending: false });

    if (pubsError)
      throw new Error(`Error recuperando publicaciones: ${pubsError.message}`);
    return publications.map((pub) => ({
      pub: {
        id: pub.id,
        sub_id: pub.sub_id,
        user_id: pub.user_id,
        title: pub.title,
        content: pub.content,
        score: pub.score,
        created_at: pub.created_at,
        img_url: pub.img_url,
      },
      accent: pub.subforums.accent,
    }));
  } catch (error) {
    console.error("Error recuperando publicaciones:", error);
    throw error;
  }
};

/**
 * Envía una nueva publicación.
 * @param pub - El objeto de la publicación a crear.
 * @returns El objeto de la publicación recién creada.
 */
export const submitPub = async (pub: Publication) => {
  const { data, error } = await supabase.from("publications").insert([pub]);
  if (error) throw error;
  return data;
};

/**
 * Elimina una publicación por su ID y todos los comentarios asociados.
 * @param pubId - El ID de la publicación a eliminar.
 */
export const deletePub = async (pubId: string): Promise<void> => {
  // Primero, elimina los comentarios asociados con la publicación
  const { error: commentsError } = await supabase
    .from("comments")
    .delete()
    .eq("pub_id", pubId);

  if (commentsError) {
    throw new Error(`Error borrando comentarios: ${commentsError.message}`);
  }

  // Luego, elimina la publicación
  const { error: pubError } = await supabase
    .from("publications")
    .delete()
    .eq("id", pubId);

  if (pubError) {
    throw new Error(`Error borrando publicación: ${pubError.message}`);
  }
};

/**
 * Calcula la puntuación total de una publicación sumando todos los votos registrados.
 *
 * Esta función recupera los votos de una publicación específica desde la base de datos
 * y suma los valores de los votos para obtener una puntuación total. Los votos pueden ser positivos o negativos,
 * dependiendo de cómo se registren en la base de datos.
 *
 * @param {string} publicationId - El ID de la publicación para la cual se calculará la puntuación.
 * @returns {Promise<number | null>} Retorna la puntuación total calculada de la publicación, o `null` si ocurre un error.
 * @throws {Error} Lanza un error si ocurre un problema al acceder a la base de datos o al procesar los datos.
 *
 */
export const calculateScore = async (
  publicationId: string,
): Promise<number | null> => {
  try {
    // Query the votes table for the specific publication ID and calculate the score
    const { data, error } = await supabase
      .from("votes") // Your table name
      .select("vote", { count: "exact" }) // Select the 'vote' column and enable counting
      .eq("publication_id", publicationId); // Filter for the publication ID

    if (error) {
      throw error;
    }

    // Calculate the score by summing the votes
    const score = data.reduce((total, vote) => total + vote.vote, 0);

    return score;
  } catch (error) {
    console.error("Error calculando puntuación:", error.message);
    return null;
  }
};

/**
 * Obtiene todos los comentarios de una publicación.
 * @param pubId - El ID de la publicación.
 * @returns Una lista de objetos de comentarios.
 */
export const fetchComments = async (
  pubId: string,
  parentCommentId: string | null = null,
): Promise<Comment[]> => {
  let query = supabase.from("comments").select("*").eq("pub_id", pubId);
  if (!!parentCommentId) query = query.eq("parent_comment", parentCommentId);
  query = query.order("score", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data as Comment[];
};

/**
 * Recupera un comentario por su ID desde la base de datos.
 *
 * @param {string} commentId - El ID del comentario que se desea recuperar.
 * @returns {Promise<Comment | null>} Retorna el comentario correspondiente si se encuentra, o null si no se encuentra.
 * @throws {Error} Lanza un error si ocurre un problema al recuperar el comentario desde la base de datos.
 */
export const fetchComment = async (
  commentId: string,
): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (error) {
    throw error;
  }

  return data as Comment;
};

/**
 * Recupera el voto de un usuario sobre un comentario específico.
 *
 * @param {string} commentId - El ID del comentario sobre el que se votó.
 * @param {string} userId - El ID del usuario que realizó el voto.
 * @returns {Promise<{ vote: number } | null>} Retorna el voto del usuario (1 o -1) si se encuentra, o null si no hay voto registrado.
 * @throws {Error} Lanza un error si ocurre un problema al recuperar el voto del comentario.
 *
 * @remarks Si no se encuentra un voto (cuando no hay datos), el error tiene el código `PGRST116`, que se maneja para no interrumpir el flujo.
 */
export const fetchCommentVote = async (commentId: string, userId: string) => {
  const { data, error } = await supabase
    .from("comment_votes")
    .select("vote")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .single();

  if (error && error.code !== "PGRST116") {
    // code PGRST116 means no rows found
    throw new Error(`Error recuperando voto: ${error.message}`);
  }

  return data;
};

/**
 * Recupera el voto de un usuario sobre una publicación específica.
 *
 * @param {string} pubId - El ID de la publicación sobre la que se votó.
 * @param {string} userId - El ID del usuario que realizó el voto.
 * @returns {Promise<{ vote: number } | null>} Retorna el voto del usuario (1 o -1) si se encuentra, o null si no hay voto registrado.
 * @throws {Error} Lanza un error si ocurre un problema al recuperar el voto de la publicación.
 *
 * @remarks Si no se encuentra un voto (cuando no hay datos), el error tiene el código `PGRST116`, que se maneja para no interrumpir el flujo.
 */
export const fetchPublicationVote = async (pubId: string, userId: string) => {
  const { data, error } = await supabase
    .from("publication_votes")
    .select("vote")
    .eq("user_id", userId)
    .eq("pub_id", pubId)
    .single();

  if (error && error.code !== "PGRST116") {
    // code PGRST116 means no rows found
    throw new Error(`Error recuperando voto: ${error.message}`);
  }

  return data;
};

/**
 * Envía un nuevo comentario a una publicación.
 * @param comment - El objeto de comentario a crear.
 * @returns El objeto de comentario recién creado.
 */
export const submitComment = async (
  userId: string,
  pubId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<void> => {
  if (!userId) {
    throw new Error("Usuario no autenticado");
  }

  const { error } = await supabase.from("comments").insert([
    {
      pub_id: pubId,
      content: content,
      user_id: userId,
      parent_comment: parentCommentId,
    },
  ]);

  if (error) {
    throw error;
  }
};

/**
 * Elimina un comentario por su ID.
 * @param commentId - El ID del comentario a eliminar.
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error: childCommentsError } = await supabase
    .from("comments")
    .delete()
    .eq("parent_comment", commentId);

  if (childCommentsError) {
    throw new Error(
      `Error borrando comentarios hijo: ${childCommentsError.message}`,
    );
  }

  // Then, delete the comment itself
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(`Error borrando comentario: ${error.message}`);
  }
};
/**
 * Vota un comentario, ya sea insertando, actualizando o eliminando un voto previo.
 * También actualiza la puntuación del comentario después de cada acción.
 *
 * @param {string} userId - El ID del usuario que realiza el voto.
 * @param {string} commentId - El ID del comentario que se está votando.
 * @param {number} vote - El valor del voto, que puede ser 1 (positivo) o -1 (negativo).
 * @returns {Promise<{ success: boolean, newScore: number }>} Retorna un objeto con el éxito de la operación y la nueva puntuación del comentario.
 * @throws {Error} Si ocurre un error en cualquier parte del proceso (consultas, actualización, etc.).
 */
export const voteComment = async (
  userId: string,
  commentId: string,
  vote: number,
) => {
  const supabaseError = (action: string, error: any) => {
    throw new Error(`Error ${action}: ${error?.message}`);
  };

  // Realiza las consultas en paralelo: una para obtener el voto existente y otra para obtener la puntuación del comentario.
  const [
    { data: existingVote, error: voteError },
    { data: commentData, error: commentError },
  ] = await Promise.all([
    supabase
      .from("comment_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("comment_id", commentId)
      .single(),
    supabase.from("comments").select("score").eq("id", commentId).single(),
  ]);

  // Manejo de errores para las consultas de votos y puntuación
  if (voteError && voteError.code !== "PGRST116")
    supabaseError("fetching vote", voteError);
  if (commentError || !commentData)
    supabaseError("fetching comment score", commentError);

  let newScore = commentData.score;

  // Si ya existe un voto para este comentario
  if (existingVote) {
    const { vote: existingVoteValue } = existingVote;

    // Si el voto actual es el mismo que el anterior, eliminar el voto
    if (existingVoteValue === vote) {
      const { error: deleteError } = await supabase
        .from("comment_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      if (deleteError) supabaseError("deleting vote", deleteError);

      newScore -= vote; // Restar el valor del voto al puntaje
    } else {
      // Si el voto es diferente, actualizar el voto
      const { error: updateError } = await supabase
        .from("comment_votes")
        .update({ vote })
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      if (updateError) supabaseError("updating vote", updateError);

      newScore += vote * 2; // Revertir el voto anterior y agregar el nuevo
    }
  } else {
    // Si no existe un voto previo, insertar un nuevo voto
    const { error: insertError } = await supabase
      .from("comment_votes")
      .insert([{ user_id: userId, comment_id: commentId, vote }]);
    if (insertError) supabaseError("inserting vote", insertError);

    newScore += vote; // Agregar el voto al puntaje del comentario
  }

  // Actualizar la puntuación del comentario en la base de datos
  const { error: scoreError } = await supabase
    .from("comments")
    .update({ score: newScore })
    .eq("id", commentId);
  if (scoreError) supabaseError("updating comment score", scoreError);

  // Retornar el resultado con la nueva puntuación del comentario
  return { success: true, newScore };
};

/**
 * Vota una publicación, ya sea insertando, actualizando o eliminando un voto previo.
 * Luego, actualiza la puntuación de la publicación basándose en el voto dado.
 *
 * @param {string} userId - El ID del usuario que realiza el voto.
 * @param {string} pubId - El ID de la publicación que se está votando.
 * @param {number} vote - El valor del voto, que puede ser 1 (positivo) o -1 (negativo).
 * @returns {Promise<{ success: boolean, newScore: number }>} Retorna un objeto con el éxito de la operación y la nueva puntuación de la publicación.
 * @throws {Error} Si ocurre un error en cualquier parte del proceso (consultas, actualización, etc.).
 */
export const votePublication = async (
  userId: string,
  pubId: string,
  vote: number,
) => {
  const supabaseError = (action: string, error: any) => {
    throw new Error(`Error ${action}: ${error?.message}`);
  };

  // Realiza las consultas en paralelo: una para obtener el voto existente y otra para obtener la puntuación de la publicación.
  const [
    { data: existingVote, error: voteError },
    { data: pubData, error: pubError },
  ] = await Promise.all([
    supabase
      .from("publication_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("pub_id", pubId)
      .single(),
    supabase.from("publications").select("score").eq("id", pubId).single(),
  ]);

  // Manejo de errores para las consultas de votos y puntuación
  if (voteError && voteError.code !== "PGRST116")
    supabaseError("fetching vote", voteError);
  if (pubError || !pubData)
    supabaseError("fetching publication score", pubError);

  let newScore = pubData.score;

  // Si ya existe un voto para esta publicación
  if (existingVote) {
    const { vote: existingVoteValue } = existingVote;

    // Si el voto actual es el mismo que el anterior, eliminar el voto
    if (existingVoteValue === vote) {
      const { error: deleteError } = await supabase
        .from("publication_votes")
        .delete()
        .eq("user_id", userId)
        .eq("pub_id", pubId);
      if (deleteError) supabaseError("deleting vote", deleteError);

      newScore -= vote; // Restar el valor del voto al puntaje
    } else {
      // Si el voto es diferente, actualizar el voto
      const { error: updateError } = await supabase
        .from("publication_votes")
        .update({ vote })
        .eq("user_id", userId)
        .eq("pub_id", pubId);
      if (updateError) supabaseError("updating vote", updateError);

      newScore += vote * 2; // Revertir el voto anterior y agregar el nuevo
    }
  } else {
    // Si no existe un voto previo, insertar un nuevo voto
    const { error: insertError } = await supabase
      .from("publication_votes")
      .insert([{ user_id: userId, pub_id: pubId, vote }]);
    if (insertError) supabaseError("inserting vote", insertError);

    newScore += vote; // Agregar el voto al puntaje de la publicación
  }

  // Actualizar la puntuación de la publicación en la base de datos
  const { error: scoreError } = await supabase
    .from("publications")
    .update({ score: newScore })
    .eq("id", pubId);
  if (scoreError) supabaseError("updating publication score", scoreError);

  // Retornar el resultado con la nueva puntuación de la publicación
  return { success: true, newScore };
};

export const relativeTime = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const seconds = 1;
  const minute = 60;
  const hour = 60 * 60;
  const day = 60 * 60 * 24;
  const week = 60 * 60 * 24 * 7;
  const month = 60 * 60 * 24 * 30;
  const year = 60 * 60 * 24 * 365;

  const formatTime = (value: number, singular: string, plural: string) =>
    value === 1 ? `Hace 1 ${singular}` : `Hace ${value} ${plural}`;

  if (diffInSeconds < minute) {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / seconds), 1),
      "segundo",
      "segundos",
    );
  } else if (diffInSeconds < hour) {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / minute), 1),
      "minuto",
      "minutos",
    );
  } else if (diffInSeconds < day) {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / hour), 1),
      "hora",
      "horas",
    );
  } else if (diffInSeconds < week) {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / day), 1),
      "día",
      "días",
    );
  } else if (diffInSeconds < month) {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / week), 1),
      "semana",
      "semanas",
    );
  } else if (diffInSeconds < year) {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / month), 1),
      "mes",
      "meses",
    );
  } else {
    return formatTime(
      Math.max(Math.floor(diffInSeconds / year), 1),
      "año",
      "años",
    );
  }
};
