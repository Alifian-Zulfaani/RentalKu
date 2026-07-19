import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("rentalku_token") || null);
  const admin = ref(
    JSON.parse(localStorage.getItem("rentalku_admin") || "null"),
  );

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    token.value = data.token;
    admin.value = data.admin;
    localStorage.setItem("rentalku_token", data.token);
    localStorage.setItem("rentalku_admin", JSON.stringify(data.admin));
    return data;
  }

  function logout() {
    token.value = null;
    admin.value = null;
    localStorage.removeItem("rentalku_token");
    localStorage.removeItem("rentalku_admin");
  }

  return { token, admin, isAuthenticated, login, logout };
});
