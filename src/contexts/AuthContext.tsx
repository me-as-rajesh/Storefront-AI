"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User as FirebaseUser } from "firebase/auth"; // For type consistency

// Mock User type, can be replaced with FirebaseUser
interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  signup: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock authentication check
    const mockUser = sessionStorage.getItem("user");
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    setLoading(true);
    const mockUser = { uid: "mock-uid-123", email };
    sessionStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    router.push("/dashboard");
  };

  const signup = (email: string) => {
    setLoading(true);
    const mockUser = { uid: "mock-uid-123", email };
    sessionStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    router.push("/dashboard");
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
