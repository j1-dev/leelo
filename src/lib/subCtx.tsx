import { createContext, useState, useEffect, useContext } from "react";
import { fetchComments, fetchSub } from "./api";
import { useAuth } from "./ctx";

const SubContext = createContext({
  setSubId: null,
  name: "",
  accent: null,
  setUpdate: null,
});

export const useSub = () => {
  return useContext(SubContext);
};

const SubProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [subId, setSubId] = useState<string>("");
  const [accent, setAccent] = useState<string>("");

  useEffect(() => {
    if (subId !== "") {
      fetchSub(subId)
        .then((sub) => {
          setAccent(sub.accent);
          setName(sub.name);
        })
        .catch((error) => console.error(error));
      setUpdate(false);
    }
  }, [subId, update]);

  return (
    <SubContext.Provider value={{ setSubId, name, accent, setUpdate }}>
      {children}
    </SubContext.Provider>
  );
};

export default SubProvider;
