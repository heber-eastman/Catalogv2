import * as React from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "catalog.auth.user";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.warn("Failed to parse stored auth user", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = React.useState(false);

  const persistUser = React.useCallback((value: AuthUser | null) => {
    try {
      if (value) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Failed to persist auth user", error);
    }
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Mock auth flow: wait briefly to simulate network
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nextUser: AuthUser = {
      id: "demo-user",
      name: email.split("@")[0]?.replace(/\./g, " ") || "Catalog User",
      email,
    };

    setUser(nextUser);
    persistUser(nextUser);
    setIsLoading(false);
  }, [persistUser]);

  const signOut = React.useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setUser(null);
    persistUser(null);
    setIsLoading(false);
  }, [persistUser]);

  const value = React.useMemo<AuthContextValue>(() => ({
    isAuthenticated: Boolean(user),
    isLoading,
    user,
    signIn,
    signOut,
  }), [user, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
