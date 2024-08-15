import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments } from "./api";
import { useAuth } from "./ctx";

const PostContext = createContext({
  setPostId: null,
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
  const [comments, setComments] = useState([]);
  const [score, setScore] = useState<number>(0);
  const { session } = useAuth();

  useEffect(() => {
    if (postId !== "") {
      fetchComments(postId).then((comms) => setComments(comms));
      setUpdate(false);
    }
  }, [postId, update]);

  return (
    <PostContext.Provider value={{ setPostId, comments, score, setUpdate }}>
      {children}
    </PostContext.Provider>
  );
};

export default PostProvider;
