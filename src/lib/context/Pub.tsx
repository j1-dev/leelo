import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchPub } from "@/lib/utils/api";

const PubContext = createContext({
  setPubId: null,
  title: "",
  comments: null,
  score: null,
  setUpdate: null,
  updateComment: null, // New function to update a comment
});

export const usePub = () => {
  return useContext(PubContext);
};

const PubProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [PubId, setPubId] = useState<string>("");
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
        const comments = await fetchComments(PubId);
        setComments(comments);
      } catch (error) {
        console.error(error);
      }
    };

    const getPub = async (id: string) => {
      try {
        const Pub = await fetchPub(id);
        setTitle(Pub.title);
      } catch (error) {
        console.error(error);
      }
    };

    if (PubId !== "") {
      getComments(PubId);
      getPub(PubId);
      setUpdate(false);
    }
  }, [PubId, update]);

  return (
    <PubContext.Provider
      value={{ setPubId, title, comments, score, setUpdate, updateComment }} // Add updateComment to context
    >
      {children}
    </PubContext.Provider>
  );
};

export default PubProvider;
