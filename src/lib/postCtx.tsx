import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchPost, fetchUser } from "./api";
import { useAuth } from "./ctx";

const PostContext = createContext({
  setPostId: null,
  title: "",
  comments: null,
  score: null,
  setUpdate: null,
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
      value={{ setPostId, title, comments, score, setUpdate }}
    >
      {children}
    </PostContext.Provider>
  );
};

export default PostProvider;
