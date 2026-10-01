<template>
  <main class="login-page">
    <div class="login-panel">
      <router-link to="/" class="brand"
        ><span>R.</span>RentalKu</router-link
      >
      <div class="login-copy">
        <p class="eyebrow">Panel RentalKu</p>
        <h1>Kelola pendaftaran bisnis.</h1>
        <p>
          Tinjau pendaftar aplikasi Rental dan Booking dari satu tempat.
        </p>
      </div>
      <div class="login-notes">
        <span><Check :size="16" />Pendaftaran Rental dan Booking terpisah</span
        ><span><Check :size="16" />Status setiap pendaftar mudah dipantau</span>
      </div>
    </div>
    <section class="login-form-wrap">
      <div class="login-card">
        <div>
          <p class="eyebrow">Akses admin</p>
          <h2>Selamat datang kembali</h2>
          <p class="form-intro">
            Gunakan akun administrator untuk melanjutkan.
          </p>
        </div>
        <form @submit.prevent="handleLogin">
          <label class="field"
            ><span>Email</span
            ><input
              v-model.trim="email"
              type="email"
              autocomplete="email"
              required
              placeholder="admin@rentalku.com" /></label
          ><label class="field"
            ><span>Kata sandi</span>
            <div class="password-input">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="Masukkan kata sandi"
              /><button
                type="button"
                :aria-label="
                  showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                "
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="17" /><Eye
                  v-else
                  :size="17"
                />
              </button></div
          ></label>
          <p v-if="error" class="error-message">
            <AlertCircle :size="16" />{{ error }}
          </p>
          <button
            class="btn btn-primary btn-block btn-lg"
            :disabled="loading"
            type="submit"
          >
            {{ loading ? "Memeriksa akun..." : "Masuk" }}
            <ArrowRight v-if="!loading" :size="17" />
          </button>
        </form>
        <router-link to="/" class="return-link"
          ><ArrowLeft :size="15" /> Kembali ke situs RentalKu</router-link
        >
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { getApiError } from "../../utils/formatters";

const router = useRouter();
const auth = useAuthStore();
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");
async function handleLogin() {
  loading.value = true;
  error.value = "";
  try {
    await auth.login(email.value, password.value);
    router.push("/admin/dashboard");
  } catch (requestError) {
    error.value = getApiError(
      requestError,
      "Login belum berhasil. Periksa kembali akun Anda.",
    );
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 0.9fr 1.1fr;
  background: var(--bg-primary);
}
.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(30px, 6vw, 76px);
  background: var(--admin-sidebar);
  color: var(--text-primary);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
}
.brand > span {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border-radius: 6px;
  background: var(--sidebar-brand);
  color: var(--sidebar-brand-text);
}
.login-copy {
  max-width: 410px;
  margin: auto 0;
}
.eyebrow {
  color: var(--accent-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.login-copy h1 {
  margin: 11px 0 13px;
  font-size: clamp(2.2rem, 4vw, 3.7rem);
}
.login-copy p:last-child {
  color: var(--text-secondary);
}
.login-notes {
  display: grid;
  gap: 9px;
  color: var(--text-secondary);
  font-size: 0.8rem;
}
.login-notes span {
  display: flex;
  align-items: center;
  gap: 7px;
}
.login-notes svg {
  color: var(--accent-primary);
}
.login-form-wrap {
  display: grid;
  place-items: center;
  padding: 32px;
}
.login-card {
  width: min(405px, 100%);
}
.login-card .eyebrow {
  color: var(--accent-primary);
}
.login-card h2 {
  margin: 9px 0 6px;
  font-size: 1.65rem;
}
.form-intro {
  color: var(--text-secondary);
  font-size: 0.88rem;
}
.login-card form {
  display: grid;
  gap: 17px;
  margin: 30px 0 19px;
}
.field {
  display: grid;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}
.field input {
  width: 100%;
  min-height: 43px;
  padding: 9px 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  outline: none;
  background: var(--surface);
  color: var(--text-primary);
}
.field input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.password-input {
  position: relative;
}
.password-input input {
  padding-right: 42px;
}
.password-input button {
  position: absolute;
  top: 1px;
  right: 1px;
  bottom: 1px;
  display: grid;
  width: 39px;
  place-items: center;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
}
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -5px 0 0;
  color: var(--danger);
  font-size: 0.77rem;
  font-weight: 700;
}
.return-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}
.return-link:hover {
  color: var(--accent-primary);
}
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }
  .login-panel {
    min-height: 290px;
    padding: 28px 24px;
  }
  .login-copy {
    margin: 43px 0 0;
  }
  .login-copy h1 {
    font-size: 2rem;
  }
  .login-notes {
    display: none;
  }
  .login-form-wrap {
    padding: 38px 24px;
  }
}
@media (max-width: 480px) {
  .login-panel { min-height: 245px; padding: 22px 18px; }
  .login-copy { margin-top: 29px; }
  .login-copy h1 { font-size: 1.7rem; }
  .login-form-wrap { padding: 30px 18px; }
}
</style>
