import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchPost } from "./api";

const PostContext = createContext({
  setPostId: null,
  title: "",
  comments: null,
  score: null,
  setUpdate: null,
  updateComment: null, // New function to update a comment
});

export const usePost = () => {
  return useContext(PostContext);
};

const PostProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [postId, setPostId] = useState<string>("");
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
        const comments = await fetchComments(postId);
        setComments(comments);
      } catch (error) {
        console.error(error);
      }
    };

    const getPost = async (id: string) => {
      try {
        const post = await fetchPost(id);
        setTitle(post.title);
      } catch (error) {
        console.error(error);
      }
    };

    if (postId !== "") {
      getComments(postId);
      getPost(postId);
      setUpdate(false);
    }
  }, [postId, update]);

  return (
    <PostContext.Provider
      value={{ setPostId, title, comments, score, setUpdate, updateComment }} // Add updateComment to context
    >
      {children}
    </PostContext.Provider>
  );
};

export default PostProvider;
