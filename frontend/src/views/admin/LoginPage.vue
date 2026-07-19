<template>
  <div class="login-page">
    <div class="login-bg"><div class="login-orb"></div></div>
    <div class="login-card glass-card">
      <div class="login-header">
        <h1>Rental<span class="text-gradient">Ku</span></h1>
        <p>Masuk ke dashboard admin</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            type="email"
            class="form-input"
            v-model="email"
            placeholder="admin@rentalku.com"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="password-wrapper">
            <input
              :type="showPass ? 'text' : 'password'"
              class="form-input"
              v-model="password"
              placeholder="Masukkan password"
              required
            />
            <button
              type="button"
              class="pass-toggle"
              @click="showPass = !showPass"
            >
              <svg
                v-if="!showPass"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>
        <div class="error-msg" v-if="error">{{ error }}</div>
        <button
          type="submit"
          class="btn btn-primary btn-block btn-lg"
          :disabled="loading"
        >
          {{ loading ? "Memproses..." : "Masuk" }}
        </button>
      </form>
      <div class="login-footer">
        <router-link to="/">← Kembali ke beranda</router-link>
      </div>
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
const showPass = ref(false);
const loading = ref(false);
const error = ref("");

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
  position: relative;
  padding: 20px;
}
.login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
.login-orb {
  width: 500px;
  height: 500px;
  background: #7c3aed;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 48px 40px;
  position: relative;
  z-index: 2;
}
.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.login-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}
.login-header p {
  color: var(--text-secondary);
}
.password-wrapper {
  position: relative;
}
.pass-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  color: var(--text-muted);
  padding: 4px;
}
.error-msg {
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 16px;
  padding: 10px 16px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
}
.login-footer {
  text-align: center;
  margin-top: 24px;
}
.login-footer a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s;
}
.login-footer a:hover {
  color: var(--text-accent);
}
</style>
