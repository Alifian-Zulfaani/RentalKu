<template>
  <div class="login-page">
    <router-link to="/" class="back-link">← Kembali ke website</router-link>
    <section class="login-scene" aria-label="Perjalanan outdoor">
      <div class="scene-copy">
        <span>Rental operations</span>
        <h2>Gear siap. Trip berjalan. Operasional tetap rapi.</h2>
        <p>Kelola inventaris dan booking dari satu tempat.</p>
      </div>
    </section>
    <div class="login-card glass-card">
      <div class="login-header">
        <BrandMark compact />
        <span>Area pengelola</span>
        <h1>Masuk ke dashboard</h1>
        <p>Kelola inventaris, booking, dan pelanggan toko rental Anda.</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            class="form-input"
            v-model="email"
            required
            placeholder="admin@email.com"
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            class="form-input"
            v-model="password"
            required
            placeholder="••••••••"
            autocomplete="current-password"
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
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import BrandMark from "../../components/shared/BrandMark.vue";

const router = useRouter();
const route = useRoute();
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
    router.push(
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : "/admin/dashboard",
    );
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
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
  align-items: center;
  gap: clamp(36px, 6vw, 90px);
  padding: 28px clamp(28px, 5vw, 76px) 28px 28px;
  position: relative;
  background: var(--admin-bg);
}
.back-link {
  position: absolute;
  top: 44px;
  left: 48px;
  z-index: 2;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 750;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
}
.back-link:hover {
  color: #f0d3a3;
}
.login-scene {
  position: relative;
  width: 100%;
  height: calc(100vh - 56px);
  min-height: 590px;
  overflow: hidden;
  border-radius: 4px 26px 4px 26px;
  background:
    linear-gradient(180deg, rgba(9, 24, 18, 0.06), rgba(9, 24, 18, 0.74)),
    url("/images/rentalku-outdoor-hero.jpg") center / cover;
  box-shadow: var(--shadow-lg);
}
.scene-copy {
  position: absolute;
  right: clamp(24px, 5vw, 68px);
  bottom: clamp(30px, 7vw, 76px);
  left: clamp(24px, 5vw, 68px);
  max-width: 590px;
  color: #fff;
}
.scene-copy span {
  color: #e7c18a;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.scene-copy h2 {
  margin-top: 12px;
  font-size: clamp(2.1rem, 4.4vw, 4.2rem);
  letter-spacing: -0.05em;
  text-wrap: balance;
}
.scene-copy p {
  margin-top: 13px;
  color: #d7e0db;
}
.login-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  justify-self: center;
  box-shadow: var(--shadow-md);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-header :deep(.brand-lockup) {
  margin: 0 auto 14px;
}
.login-header > span {
  display: block;
  color: var(--brand-primary);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.login-header h1 {
  font-size: 1.8rem;
  margin: 8px 0;
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
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 80px 20px 30px;
  }
  .login-scene {
    position: absolute;
    inset: 0;
    height: 100%;
    min-height: 0;
    border-radius: 0;
    opacity: 0.16;
  }
  .login-scene::after {
    position: absolute;
    inset: 0;
    background: var(--admin-bg);
    content: "";
    opacity: 0.55;
  }
  .scene-copy {
    display: none;
  }
  .back-link {
    top: 26px;
    left: 24px;
    color: var(--text-primary);
    text-shadow: none;
  }
  .login-card {
    position: relative;
    z-index: 1;
  }
}
@media (max-width: 480px) {
  .login-card {
    padding: 30px 22px;
  }
}
</style>
