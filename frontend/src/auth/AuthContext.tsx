import { createContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { UserRoleConst } from "@/components/constants/constants";

interface UserAuthContextType {
  id: number;
  fullName: string;
  email: string;
  role: UserRoleConst;
}
interface AuthContextType {
  user: UserAuthContextType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthContextType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data from the server
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

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
        "http://localhost:3000/api/v1/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const accessToken = response.data.accessToken;
      localStorage.setItem("accessToken", accessToken);

      // Set user from login response
      setUser(response.data.user);
      setLoading(false);

      navigate("/");
    } catch (error) {
      setLoading(false);
      handleAxiosError(error);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
