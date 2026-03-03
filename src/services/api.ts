import axios from "axios";
import { getStoredToken } from "../utils/auth";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = envBaseUrl || "https://localhost:7290";

if (!envBaseUrl) {
  console.warn(
    "[config] VITE_API_BASE_URL is not set. Falling back to https://localhost:7290",
  );
}

export const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
