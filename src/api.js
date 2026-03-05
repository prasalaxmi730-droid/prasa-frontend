import axios from "axios";

const normalizeApiBase = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const fallbackApiBase = "https://prasa-app-eh1g.onrender.com/api";
export const API_BASE_URL = normalizeApiBase(process.env.REACT_APP_API_BASE_URL) || fallbackApiBase;

const envBackendOrigin = String(process.env.REACT_APP_BACKEND_ORIGIN || "").trim();
export const BACKEND_ORIGIN = envBackendOrigin || API_BASE_URL.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_BASE_URL
});

/* Debug logs */
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  if (!token) {
    try {
      const employee = JSON.parse(localStorage.getItem("employee") || "null");
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      token = employee?.token || admin?.token || null;
    } catch {
      token = null;
    }
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("API REQUEST:", config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("API RESPONSE:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API ERROR:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
