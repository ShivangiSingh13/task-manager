import { createContext, useContext, useEffect, useState } from "react";
import { api, clearStoredAuth, getErrorMessage, getStoredAuth, persistAuth } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getStoredAuth());
  const [authLoading, setAuthLoading] = useState(() => Boolean(getStoredAuth()?.token));

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedSession = getStoredAuth();

      if (!storedSession?.token) {
        setAuthLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");

        if (!isMounted) {
          return;
        }

        const nextSession = {
          token: storedSession.token,
          user: data.user
        };

        persistAuth(nextSession);
        setSession(nextSession);
      } catch {
        clearStoredAuth();

        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSession = (payload) => {
    const nextSession = {
      token: payload.token,
      user: payload.user
    };

    persistAuth(nextSession);
    setSession(nextSession);
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    saveSession(data);
    return data;
  };

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    saveSession(data);
    return data;
  };

  const logout = () => {
    clearStoredAuth();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        token: session?.token || "",
        authLoading,
        login,
        register,
        logout,
        getAuthError: getErrorMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};