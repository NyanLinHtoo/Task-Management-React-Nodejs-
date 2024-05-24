import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const AUTH_API_ENDPOINT = import.meta.env.VITE_AUTH_API_ENDPOINT;

export const apiClient = axios.create({
  baseURL: API_ENDPOINT,
});

export const authApiClient = axios.create({
  baseURL: AUTH_API_ENDPOINT,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-authentication-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);