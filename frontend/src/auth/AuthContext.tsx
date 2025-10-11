import axios from "axios";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { createContext, useEffect, useState, type ReactNode } from "react";

export interface UserAuthContextType {
  id: number;
  fullName: string;
  email: string;
  role: string[];
  permissions: string[];
}

interface AuthContextType {
  user: UserAuthContextType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchPermissions: (resource: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthContextType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const accessToken = response.data.accessToken;
      localStorage.setItem("accessToken", accessToken);
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setLoading(false);
      navigate("/auth/login");
    }
  };

  const fetchPermissions = async (resource: string) => {
    try {
      if (!resource) return;
      const response = await api.get(
        `${backendUrl}/users/me/permissions?resource=${resource}`
      );

      setUser((prev) =>
        prev ? { ...prev, permissions: response.data.permissions } : null
      );
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, fetchPermissions }}
    >
      {children}
    </AuthContext.Provider>
  );
};
