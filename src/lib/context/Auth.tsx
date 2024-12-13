import { Session, User } from "@supabase/supabase-js";
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/utils/supabase";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  setLoading: null,
  signOut: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  // Define los estados para el usuario, sesión y el estado de carga
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Usa el listener de cambios de estado de autenticación de Supabase
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Actualiza el estado con la nueva sesión y usuario cuando cambia el estado de autenticación
        setSession(session);
        setUser(session?.user || null); // Si hay sesión, establece el usuario; si no, establece null
        setLoading(false); // Marca el estado de carga como falso
      },
    );

    // Limpieza del listener al desmontar el componente
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []); // El efecto solo se ejecuta una vez cuando el componente se monta

  // Función para cerrar sesión
  const signOut = async () => {
    const { error } = await supabase.auth.signOut(); // Cierra la sesión usando Supabase
    if (!error) {
      setUser(null); // Si no hay error, limpia el estado del usuario y la sesión
      setSession(null);
    }
    return { error }; // Retorna el error (si existe)
  };

  // Proveedor del contexto AuthContext, que pasa los valores actuales del contexto a los componentes hijos
  return (
    <AuthContext.Provider
      value={{ user, session, loading, setLoading, signOut }} // Proporciona el estado y funciones de autenticación
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
