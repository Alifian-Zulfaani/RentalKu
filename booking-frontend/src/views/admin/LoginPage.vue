<template>
  <div class="admin-shell">
    <div class="login-theme-control"><ThemeToggle /></div>
    <div class="admin-login-layout">
      <section class="login-intro">
        <a href="/" class="login-brand"
          ><span class="mark">S.</span> {{ tenantName }}</a
        >
        <div class="login-intro-copy">
          <p class="section-index">
            {{ tenantName.toUpperCase() }} / PANEL PENGELOLA
          </p>
          <h1>Setiap sesi dimulai dari jadwal yang rapi.</h1>
          <p>
            Reservasi, fotografer, layanan, dan ketersediaan tersusun di satu
            ruang kerja.
          </p>
        </div>
        <a href="/" class="login-back"
          ><ArrowLeft :size="16" /> Kembali ke situs studio</a
        >
      </section>
      <div class="login-panel">
        <div class="admin-login">
          <p class="section-index">AKSES PENGELOLA</p>
          <h1>Selamat datang kembali</h1>
          <p>Masuk untuk melanjutkan pekerjaan di studio.</p>
          <p class="admin-message" v-if="error" role="alert">
            <CircleAlert :size="17" />{{ error }}
          </p>
          <form @submit.prevent="submitLogin">
            <label
              >Email<input
                v-model.trim="credentials.email"
                type="email"
                required
                autocomplete="username"
                placeholder="nama@studiosenja.com"
            /></label>
            <label
              >Kata sandi<span class="password-control"
                ><input
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan kata sandi" /><button
                  type="button"
                  :aria-label="
                    showPassword
                      ? 'Sembunyikan kata sandi'
                      : 'Tampilkan kata sandi'
                  "
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="18" /><Eye
                    v-else
                    :size="18"
                  /></button></span
            ></label>
            <button class="button primary full" type="submit" :disabled="busy">
              {{ busy ? "Memeriksa akun…" : "Masuk ke panel" }}
              <ArrowRight v-if="!busy" :size="17" />
            </button>
          </form>
          <a href="/" class="login-back mobile-back"
            ><ArrowLeft :size="16" /> Kembali ke situs studio</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { useAdminStore } from "../../stores/admin";
import ThemeToggle from "../../components/shared/ThemeToggle.vue";
import "../../admin.css";
const router = useRouter();
const route = useRoute();
const { tenantName, error, credentials, showPassword, busy, login, token } =
  useAdminStore();
async function submitLogin() {
  await login();
  if (!token.value) return;
  const redirect =
    typeof route.query.redirect === "string" &&
    route.query.redirect.startsWith("/admin/")
      ? route.query.redirect
      : "/admin/dashboard";
  router.replace(redirect);
}
</script>
