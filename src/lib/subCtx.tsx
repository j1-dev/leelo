import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchSub } from "./api";
import { useAuth } from "./ctx";

const SubContext = createContext({
  setSubId: null,
  accent: null,
  setUpdate: null,
});

export const useSub = () => {
  return useContext(SubContext);
};

const SubProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [subId, setSubId] = useState<string>("");
  const [accent, setAccent] = useState<string>("");

  useEffect(() => {
    if (subId !== "") {
      fetchSub(subId)
        .then((sub) => {
          setAccent(sub.accent);
        })
        .catch((error) => console.error(error));
      setUpdate(false);
    }
  }, [subId, update]);

  return (
    <SubContext.Provider value={{ setSubId, accent, setUpdate }}>
      {children}
    </SubContext.Provider>
  );
};

export default SubProvider;
