import { createContext, useState, useEffect, useContext } from "react";
import { fetchModerators, fetchPubs, fetchSub } from "@/lib/utils/api";

const SubContext = createContext({
  setSubId: null,
  name: "",
  accent: null,
  createdBy: "",
  mods: null,
  pubs: null,
  setPubs: null,
  setUpdate: null,
  updatePublication: null,
});
export const useSub = () => {
  return useContext(SubContext); // Custom hook para acceder al contexto
};

const SubProvider = ({ children }) => {
  const [update, setUpdate] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [subId, setSubId] = useState<string>("");
  const [accent, setAccent] = useState<string>("");
  const [createdBy, setCreatedBy] = useState<string>("");
  const [pubs, setPubs] = useState(null);
  const [mods, setMods] = useState(null);

  // Función para actualizar una publicación dentro del estado de publicaciones
  const updatePublication = (pubId: string, changes: Partial<Comment>) => {
    setPubs((prevPubs) => {
      return prevPubs?.map((pub) => {
        if (pub.id === pubId) {
          return { ...pub, ...changes }; // Si encuentra la publicación, aplica los cambios
        }
        return pub;
      });
    });
  };

  useEffect(() => {
    if (subId !== "") {
      const fetchData = async () => {
        try {
          // Obtiene datos de moderadores, publicaciones y detalles del subforo en paralelo
          const [modData, pubData, sub] = await Promise.all([
            fetchModerators(subId),
            fetchPubs(subId),
            fetchSub(subId),
          ]);

          setMods(modData);
          setPubs(pubData);
          if (sub) {
            setAccent(sub.accent);
            setName(sub.name);
            setCreatedBy(sub.created_by);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setUpdate(false);
        }
      };

      fetchData(); // Llama a la función de obtención de datos
    }
  }, [subId, update]); // Dependencias: se ejecuta cuando subId o update cambian

  return (
    <SubContext.Provider
      value={{
        setSubId,
        name,
        accent,
        pubs,
        mods,
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
