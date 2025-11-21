import * as React from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // Mock authentication - in production, this would call your backend
    // For demo purposes, accept any email/password
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

    const mockUser: User = {
      id: "1",
      email: email,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      avatar: undefined, // Could use a service like Gravatar based on email
    };

    setUser(mockUser);
  };

  const signOut = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
