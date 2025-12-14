// client/src/utils/api.js - COMPLETE FIXED VERSION
import axios from "axios";

// IMPORTANT: Use the environment variable or fallback to correct port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

console.log("🔧 API Configuration:");
console.log("   API Base URL:", API_BASE_URL);
console.log("   Mode: REAL API with MongoDB");

// Create axios instance with correct base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle specific errors
    if (error.response?.status === 401) {
      console.log("🔐 Authentication error - token may be invalid");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    if (error.response?.status === 404) {
      console.log("❓ API endpoint not found - check server routes");
    }

    return Promise.reject(error);
  }
);

// Global auth token management
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
    localStorage.setItem("token", token);
    console.log("✅ Auth token set");
  } else {
    delete api.defaults.headers.Authorization;
    localStorage.removeItem("token");
    console.log("✅ Auth token cleared");
  }
};

// Initialize auth token on app load
const savedToken = localStorage.getItem("token");
if (savedToken) {
  setAuthToken(savedToken);
}

export { api, API_BASE_URL };