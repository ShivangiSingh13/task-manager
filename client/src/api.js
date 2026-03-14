import axios from "axios";

const AUTH_STORAGE_KEY = "mern-multi-app-auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

export const getStoredAuth = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const persistAuth = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

api.interceptors.request.use((config) => {
  const session = getStoredAuth();

  if (session?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return error.message || "Something went wrong";
};
