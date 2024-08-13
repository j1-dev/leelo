import { Session, User } from "@supabase/supabase-js";
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "./supabase";
import { fetchComments } from "./api";

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
  const [update, setUpdate] = useState<boolean>(false);
  const [postId, setPostId] = useState<string>("");
  const [comments, setComments] = useState([]);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    fetchComments(postId).then((comms) => setComments(comms));
    setUpdate(false);
    return setComments(null);
  }, [postId, update]);

  return (
    <PostContext.Provider value={{ setPostId, comments, score, setUpdate }}>
      {children}
    </PostContext.Provider>
  );
};

export default PostProvider;
