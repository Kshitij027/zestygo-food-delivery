import React, { createContext, useContext } from "react";
import { useAuth } from "./useAuth";
import { setUnauthorizedHandler } from "lib/api";
import { GoogleOAuthProvider } from "@react-oauth/google";

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | null>(null);

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  
  React.useEffect(() => {
    setUnauthorizedHandler(auth.logout);
    return () => setUnauthorizedHandler(null);
  }, [auth]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
