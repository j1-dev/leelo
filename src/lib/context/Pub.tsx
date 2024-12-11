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

export const usePub = () => {
  return useContext(PubContext);
};

const PubProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [pubId, setPubId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [comments, setComments] = useState([]);
  const [score, setScore] = useState<number>(0);

  // Helper function to update a specific comment
  const updateComment = (commentId: string, changes: Partial<Comment>) => {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, ...changes };
        }

        return comment;
      });
    });
  };

  useEffect(() => {
    setComments(null);
    const getComments = async (id: string) => {
      try {
        const comments = await fetchComments(pubId);
        setComments(comments);
      } catch (error) {
        console.error(error);
      }
    };

    const getPub = async (id: string) => {
      try {
        const pub = await fetchPub(id);
        setTitle(pub.title);
        setScore(pub.score);
        setUserId(pub.user_id);
      } catch (error) {
        console.error(error);
      }
    };

    if (pubId !== "") {
      getComments(pubId);
      getPub(pubId);
      setUpdate(false);
    }
  }, [pubId, update]);

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
      }} // Add updateComment to context
    >
      {children}
    </PubContext.Provider>
  );
};

export default PubProvider;
