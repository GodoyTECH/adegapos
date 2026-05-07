import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adega_token"));
  const [user, setUser] = useState<User | null>(null);

  // Automatically configure customFetch
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("adega_token"));
  }, []);

  const { data: me, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: ["auth-me", token],
    }
  } as any);

  useEffect(() => {
    if (me) {
      setUser(me);
    }
    if (error) {
      // If token is invalid, clear it
      logout();
    }
  }, [me, error]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("adega_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("adega_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
