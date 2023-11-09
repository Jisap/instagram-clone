import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";

import { IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/api";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => { },
  setIsAuthenticated: () => { },
  checkAuthUser: async () => false as boolean,
};

type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);             // Context para Auth (state del user)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {     // Provider para Auth (método y estados asociados al user)

  const navigate = useNavigate();
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);            // Estados

  const checkAuthUser = async () => {                                       // Obtiene el usuario logueado -> setUser - setIsAuthenticated
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();
      
      if(currentAccount){
        setUser({ 
          id: currentAccount.$id, 
          name: currentAccount.name, 
          username: currentAccount.username, 
          email: currentAccount.email, 
          imageUrl: currentAccount.imageUrl, 
          bio: currentAccount.bio 
        })
        
        return true;
      }
      setIsAuthenticated(false);
      return false;

    } catch (error) {
      console.log(error)
      return false
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback"); // Cada vez que use el provider tenemos la cookie sino redirección a sign-in
    
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      navigate("/sign-in");
    }

    checkAuthUser(); // Si tenemos la cookie obtenemos el usuario logueado -> setUser -> setIsAuthenticated
  }, []);

  const value = {   // Valores y métodos que se comparten a la app
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser
  }

  return (
    
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
        
  )
}

//export default AuthProvider;

export const useUserContext = () => useContext(AuthContext); // context para user basado en AuthContext

