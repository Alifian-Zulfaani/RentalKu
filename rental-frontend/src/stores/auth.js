import { defineStore } from "pinia";
import api from "../services/api";

const savedAdmin = localStorage.getItem("customer_rentalku_admin");
let initialAdmin = null;
try {
  initialAdmin = savedAdmin ? JSON.parse(savedAdmin) : null;
} catch {
  localStorage.removeItem("customer_rentalku_admin");
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("customer_rentalku_token") || null,
    admin: initialAdmin,
  }),
  actions: {
    async login(email, password) {
      const { data } = await api.post("/auth/login", { email, password });
      this.token = data.token;
      this.admin = data.admin;
      localStorage.setItem("customer_rentalku_token", data.token);
      localStorage.setItem(
        "customer_rentalku_admin",
        JSON.stringify(data.admin),
      );
    },
    logout() {
      this.token = null;
      this.admin = null;
      localStorage.removeItem("customer_rentalku_token");
      localStorage.removeItem("customer_rentalku_admin");
    },
  },
});
