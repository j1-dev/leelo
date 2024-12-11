import { createContext, useState, useEffect, useContext } from "react";
import { fetchPubs, fetchSub } from "@/lib/utils/api";

const SubContext = createContext({
  setSubId: null,
  name: "",
  accent: null,
  createdBy: "",
  // mods: null
  pubs: null,
  setPubs: null,
  setUpdate: null,
  updatePublication: null,
});

export const useSub = () => {
  return useContext(SubContext);
};

const SubProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [subId, setSubId] = useState<string>("");
  const [accent, setAccent] = useState<string>("");
  const [createdBy, setCreatedBy] = useState<string>("");
  const [pubs, setPubs] = useState(null);

  const updatePublication = (pubId: string, changes: Partial<Comment>) => {
    setPubs((prevPubs) => {
      return prevPubs.map((pub) => {
        if (pub.id === pubId) {
          return { ...pub, ...changes };
        }
        return pub;
      });
    });
  };

  useEffect(() => {
    if (subId !== "") {
      fetchPubs(subId).then((pubData) => {
        setPubs(pubData);
      });
      fetchSub(subId)
        .then((sub) => {
          setAccent(sub.accent);
          setName(sub.name);
          setCreatedBy(sub.created_by);
        })
        .catch((error) => console.error(error));
      setUpdate(false);
    }
  }, [subId, update]);

  return (
    <SubContext.Provider
      value={{
        setSubId,
        name,
        accent,
        pubs,
        setPubs,
        createdBy,
        setUpdate,
        updatePublication,
      }}
    >
      {children}
    </SubContext.Provider>
  );
};

export default SubProvider;
