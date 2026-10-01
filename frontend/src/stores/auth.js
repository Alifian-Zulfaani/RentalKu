import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("rentalku_token") || null);
  const savedAdmin = localStorage.getItem("rentalku_admin");
  let initialAdmin = null;

  try {
    initialAdmin = savedAdmin ? JSON.parse(savedAdmin) : null;
  } catch {
    localStorage.removeItem("rentalku_admin");
  }

  const admin = ref(initialAdmin);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    token.value = data.data.token;
    admin.value = data.data.admin;
    localStorage.setItem("rentalku_token", data.data.token);
    localStorage.setItem("rentalku_admin", JSON.stringify(data.data.admin));
    return data.data;
  }

  function logout() {
    token.value = null;
    admin.value = null;
    localStorage.removeItem("rentalku_token");
    localStorage.removeItem("rentalku_admin");
  }

  return { token, admin, isAuthenticated, login, logout };
});
