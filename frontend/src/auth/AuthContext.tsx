import axios from "axios";
import api from "@/api/api";
import { handleAxiosError } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { createContext, useEffect, useState, type ReactNode } from "react";

export interface UserAuthContextType {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: UserAuthContextType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchPermissions: (resources: string[]) => Promise<void>;
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
      const userData = res.data.user;

      if (!userData.roles || userData.roles.length === 0) {
        await logout();
        navigate("/errors/forbidden");
        return;
      }

      setUser({
        ...res.data.user,
        permissions: user?.permissions,
      });
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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const userData = response.data.user;
      if (!userData.roles || userData.roles.length === 0) {
        await logout();
        navigate("/errors/forbidden");
        return;
      }

      const accessToken = response.data.accessToken;
      localStorage.setItem("accessToken", accessToken);

      await fetchUser();

      // setUser({
      //   ...response.data.user,
      //   permissions: user?.permissions,
      // });
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

  const fetchPermissions = async (resources: string[]) => {
    try {
      if (!resources || resources.length === 0) return;

      const permissions = new Set<string>();

      const responses = await Promise.all(
        resources.map((resource) =>
          api.get(`${backendUrl}/users/me/permissions?resource=${resource}`)
        )
      );

      responses.forEach((response) => {
        const data = response.data.permissions;
        if (Array.isArray(data)) {
          data.forEach((p) => permissions.add(p));
        } else {
          permissions.add(data);
        }
      });

      setUser((prev) =>
        prev ? { ...prev, permissions: Array.from(permissions) } : null
      );
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchUser();
    };
    run();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, fetchPermissions }}
    >
      {children}
    </AuthContext.Provider>
  );
};
