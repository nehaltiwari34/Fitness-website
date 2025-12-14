// src/context/AuthContext.jsx - FULL VERSION (with updateProfile)
import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (token && userData) {
          try {
            setUser(JSON.parse(userData));
            if (window.setAuthToken) window.setAuthToken(token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success && response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (window.setAuthToken) window.setAuthToken(response.data.token);
        api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const register = async (userData) => {
    try {
      const { confirmPassword, ...registrationData } = userData;
      const response = await api.post("/auth/register", registrationData);
      if (response.data.success && response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (window.setAuthToken) window.setAuthToken(response.data.token);
        api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return { success: true, message: "Registration successful!" };
      } else {
        return { success: false, message: response.data.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error", error);
      return { success: false, message: "Registration failed. Please try again." };
    }
  };

  // ------- ADD THIS FUNCTION -------
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/profile", profileData);
      if (response.data.success && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.data.message || "Profile update failed" };
      }
    } catch (error) {
      console.error("Profile update error", error);
      return { success: false, message: "Profile update failed. Please try again." };
    }
  };
  // ---------------------------------

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.setAuthToken) window.setAuthToken(null);
    api.defaults.headers.Authorization = "";
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    updateProfile, // <- MUST be here!
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
