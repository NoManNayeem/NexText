// frontend/context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // On mount, load token & fetch user
  useEffect(() => {
    const stored = localStorage.getItem("nextext_token");
    if (stored) {
      setToken(stored);
      api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get("/users/me");
      setCurrentUser(data);
    } catch {
      logout();
    }
  };

  const login = async ({ username, password }) => {
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      const { data } = await api.post(
        "/users/login",
        form.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("nextext_token", data.access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
      setToken(data.access_token);

      await fetchCurrentUser();
      router.push("/chat");
    } catch (err) {
      // Normalize FastAPI validation errors or fallback
      const detail = err.response?.data?.detail;
      let message = "Login failed";
      if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg).join("; ");
      } else if (typeof detail === "string") {
        message = detail;
      }
      throw new Error(message);
    }
  };

  const register = async ({ username, email, password }) => {
    try {
      await api.post("/users/register", { username, email, password });
      // Auto-login after successful register
      await login({ username, password });
    } catch (err) {
      const detail = err.response?.data?.detail;
      let message = "Registration failed";
      if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg).join("; ");
      } else if (typeof detail === "string") {
        message = detail;
      }
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("nextext_token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, currentUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
