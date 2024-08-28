import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchPost } from "./api";
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
  const { session } = useAuth();

  useEffect(() => {
    setComments(null);
    if (postId !== "") {
      fetchComments(postId)
        .then((comms) => {
          setComments(comms);
        })
        .catch((error) => console.error(error));
      fetchPost(postId).then((p) => setTitle(p.title));
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
