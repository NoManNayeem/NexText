// frontend/utils/api.js

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach token automatically if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nextext_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
