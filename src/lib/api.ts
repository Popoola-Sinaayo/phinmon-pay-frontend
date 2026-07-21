import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const code = error.response?.data?.details?.code;
      if (error.response?.status === 403 && code === "ACCOUNT_SUSPENDED") {
        localStorage.removeItem("token");
        const params = new URLSearchParams({
          suspended: "1",
          message: error.response?.data?.message || "Your account has been suspended",
        });
        window.location.href = `/login?${params.toString()}`;
      }
      if (
        error.response?.status === 403 &&
        code === "TERMS_REQUIRED" &&
        !window.location.pathname.startsWith("/accept-terms")
      ) {
        window.location.href = "/accept-terms";
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};
