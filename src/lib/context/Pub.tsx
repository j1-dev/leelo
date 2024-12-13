import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchPub } from "@/lib/utils/api";

const PubContext = createContext({
  pubId: "",
  userId: "",
  setPubId: null,
  title: "",
  comments: [],
  setComments: null,
  score: null,
  setUpdate: null,
  updateComment: null, // New function to update a comment
});
// Custom hook para acceder al contexto de publicaciones
export const usePub = () => {
  return useContext(PubContext);
};

const PubProvider = ({ children }) => {
  // Estado para gestionar si los datos deben ser actualizados
  const [update, setUpdate] = useState<boolean>(true);

  // Estados para gestionar los datos de la publicación
  const [pubId, setPubId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [comments, setComments] = useState([]);
  const [score, setScore] = useState<number>(0);

  // Función para actualizar un comentario específico dentro del estado de comentarios
  const updateComment = (commentId: string, changes: Partial<Comment>) => {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, ...changes }; // Si el comentario tiene el id, actualiza con los cambios
        }

        return comment; // Si no es el comentario buscado, lo mantiene sin cambios
      });
    });
  };

  // Efecto que se ejecuta cada vez que pubId o update cambian
  useEffect(() => {
    if (pubId !== "") {
      const fetchData = async () => {
        try {
          const [comments, pub] = await Promise.all([
            fetchComments(pubId),
            fetchPub(pubId),
          ]);

          setComments(comments);
          if (pub) {
            setTitle(pub.title);
            setScore(pub.score);
            setUserId(pub.user_id);
          }
        } catch (error) {
          console.error("Error recuperando datos:", error);
        } finally {
          setUpdate(false);
        }
      };

      setComments(null); // Resetea los comentarios antes de realizar una nueva solicitud
      fetchData(); // Llama a la función para recuperar los datos
    }
  }, [pubId, update]); // El efecto se ejecuta cuando pubId o update cambian

  return (
    <PubContext.Provider
      value={{
        pubId,
        userId,
        setPubId,
        title,
        comments,
        setComments,
        score,
        setUpdate,
        updateComment,
      }}
    >
      {children}
    </PubContext.Provider>
  );
};

export default PubProvider;
