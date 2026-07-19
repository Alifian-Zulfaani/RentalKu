<template>
  <div class="login-page">
    <div class="login-card glass-card">
      <div class="login-header">
        <h2>Admin Login</h2>
        <p>Masuk ke dashboard manajemen rental Anda</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            type="email"
            class="form-input"
            v-model="email"
            required
            placeholder="admin@email.com"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            type="password"
            class="form-input"
            v-model="password"
            required
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary btn-block btn-lg"
          :disabled="loading"
        >
          {{ loading ? "Memproses..." : "Masuk" }}
        </button>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const auth = useAuthStore();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  error.value = "";
  try {
    await auth.login(email.value, password.value);
    router.push("/admin/dashboard");
  } catch (err) {
    error.value = err.response?.data?.message || "Login gagal";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--admin-bg);
}
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}
.login-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}
.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  padding: 12px;
  border-radius: var(--radius-sm);
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>
