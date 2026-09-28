<template>
  <main class="checkout-page">
    <header class="checkout-header">
      <div class="container checkout-nav">
        <router-link to="/" class="brand"
          ><span><Boxes :size="19" /></span>RentalKu</router-link
        ><router-link to="/" class="back-link"
          ><ArrowLeft :size="16" /> Kembali</router-link
        >
      </div>
    </header>
    <div class="container checkout-layout">
      <section class="checkout-main">
        <div class="checkout-heading">
          <p class="eyebrow">Early access gratis</p>
          <h1>
            {{
              isComplete
                ? "Pendaftaran diterima"
                : "Mulai workspace rental Anda"
            }}
          </h1>
          <p>
            {{
              isComplete
                ? "Kami sudah mencatat detail bisnis Anda."
                : "Lengkapi data berikut untuk bergabung di tahap awal RentalKu. Tidak ada pembayaran saat ini."
            }}
          </p>
        </div>
        <div v-if="!isComplete" class="step-indicator">
          <span class="active">1. Informasi bisnis</span
          ><span>2. Review admin</span>
        </div>
        <form
          v-if="!isComplete"
          class="checkout-form"
          @submit.prevent="openConfirmation"
        >
          <fieldset>
            <legend>Profil pemilik</legend>
            <div class="field-grid">
              <label class="field" :class="{ invalid: fieldErrors.name }"
                ><span>Nama lengkap</span
                ><input
                  v-model.trim="form.name"
                  required
                  minlength="2"
                  maxlength="100"
                  autocomplete="name"
                  placeholder="Nama Anda"
                  :aria-invalid="Boolean(fieldErrors.name)"
                  @input="clearFieldError('name')"
                /><small v-if="fieldErrors.name" class="field-error">{{
                  fieldErrors.name
                }}</small></label
              ><label class="field" :class="{ invalid: fieldErrors.email }"
                ><span>Email</span
                ><input
                  v-model.trim="form.email"
                  required
                  type="email"
                  autocomplete="email"
                  placeholder="nama@bisnis.com"
                  :aria-invalid="Boolean(fieldErrors.email)"
                  @input="clearFieldError('email')"
                /><small v-if="fieldErrors.email" class="field-error">{{
                  fieldErrors.email
                }}</small></label
              ><label class="field" :class="{ invalid: fieldErrors.whatsapp }"
                ><span>WhatsApp</span
                ><input
                  v-model.trim="form.whatsapp"
                  required
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="08xxxxxxxxxx"
                  :aria-invalid="Boolean(fieldErrors.whatsapp)"
                  @input="clearFieldError('whatsapp')"
                /><small v-if="fieldErrors.whatsapp" class="field-error">{{
                  fieldErrors.whatsapp
                }}</small></label
              >
            </div>
          </fieldset>
          <fieldset>
            <legend>Profil bisnis</legend>
            <div class="field-grid">
              <label
                class="field full"
                :class="{ invalid: fieldErrors.business_name }"
                ><span>Nama bisnis rental</span
                ><input
                  v-model.trim="form.business_name"
                  required
                  minlength="2"
                  maxlength="100"
                  placeholder="Contoh: Summit Gear"
                  :aria-invalid="Boolean(fieldErrors.business_name)"
                  @input="clearFieldError('business_name')"
                /><small v-if="fieldErrors.business_name" class="field-error">{{
                  fieldErrors.business_name
                }}</small></label
              ><label
                class="field full"
                :class="{ invalid: fieldErrors.business_type }"
                ><span>Jenis bisnis</span
                ><select
                  v-model="form.business_type"
                  required
                  :aria-invalid="Boolean(fieldErrors.business_type)"
                  @change="clearFieldError('business_type')"
                >
                  <option disabled value="">Pilih jenis bisnis</option>
                  <option
                    v-for="type in businessTypes"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option></select
                ><small v-if="fieldErrors.business_type" class="field-error">{{
                  fieldErrors.business_type
                }}</small></label
              >
            </div>
          </fieldset>
          <button
            class="btn btn-primary btn-lg submit-button"
            type="submit"
            :disabled="loading"
          >
            {{
              loading ? "Mengirim pendaftaran..." : "Kirim pendaftaran gratis"
            }}
            <ArrowRight :size="17" />
          </button>
        </form>
        <section v-else class="success-panel">
          <span class="success-icon"><CheckCircle2 :size="28" /></span>
          <h2>Terima kasih, {{ registration?.name }}.</h2>
          <p>
            Pendaftaran <strong>{{ registration?.business_name }}</strong> sudah
            masuk dan menunggu review. Agar proses lebih cepat, chat Alifian
            Zulfaani untuk konfirmasi pendaftaran Anda.
          </p>
          <div class="registration-meta">
            <span>Nomor pendaftaran</span
            ><strong>#RK-{{ registration?.id }}</strong>
          </div>
          <a
            class="whatsapp-action"
            :href="confirmationUrl"
            target="_blank"
            rel="noopener"
            ><MessageCircle :size="19" /> Chat konfirmasi WhatsApp
            <span>085740636055</span></a
          ><router-link to="/" class="return-home"
            >Kembali ke beranda</router-link
          >
        </section>
      </section>
      <aside class="order-summary">
        <p class="summary-kicker">Ringkasan akses</p>
        <h2>RentalKu Early Access</h2>
        <p class="summary-text">
          Akses awal untuk pondasi operasional rental Anda.
        </p>
        <ul>
          <li v-for="item in planItems" :key="item">
            <Check :size="16" />{{ item }}
          </li>
        </ul>
        <div class="price-summary">
          <span>Total hari ini</span><strong>Rp0</strong
          ><small>gratis selama tahap awal</small>
        </div>
        <p class="summary-footnote">
          <ShieldCheck :size="15" /> Pendaftaran akan direview admin sebelum
          akses diaktifkan.
        </p>
      </aside>
    </div>
    <ToastMessage :message="error" type="error" @close="error = ''" />
    <ConfirmModal
      :isOpen="showConfirmation"
      title="Periksa pendaftaran Anda"
      :message="confirmationMessage"
      confirmText="Ya, kirim pendaftaran"
      @cancel="showConfirmation = false"
      @confirm="submitOrder"
    />
  </main>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
} from "lucide-vue-next";
import api from "../../services/api";
import ConfirmModal from "../../components/admin/ConfirmModal.vue";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import { getApiError } from "../../utils/formatters";

const loading = ref(false);
const isComplete = ref(false);
const registration = ref(null);
const error = ref("");
const showConfirmation = ref(false);
const fieldErrors = reactive({});
const form = reactive({
  name: "",
  email: "",
  whatsapp: "",
  business_name: "",
  business_type: "",
});
const businessTypes = [
  "Peralatan outdoor",
  "Kamera & videografi",
  "Sound system",
  "Tenda & dekorasi",
  "Kendaraan",
  "Meja & kursi",
  "Lainnya",
];
const planItems = [
  "Order dan pelanggan tanpa batas",
  "Inventaris dan stok rental",
  "Halaman booking untuk bisnis",
  "Ringkasan operasional",
  "Dukungan via WhatsApp",
];
const confirmationUrl = computed(() => {
  const business = registration.value?.business_name || "bisnis saya";
  const id = registration.value?.id || "";
  return `https://wa.me/6285740636055?text=${encodeURIComponent(`Halo Kak Alifian, saya ingin konfirmasi pendaftaran RentalKu untuk ${business}. Nomor pendaftaran: RK-${id}.`)}`;
});
const confirmationMessage = computed(() => {
  const business = form.business_name || "bisnis Anda";
  return `${business} akan didaftarkan ke RentalKu Early Access tanpa biaya. Pastikan email dan nomor WhatsApp Anda sudah benar sebelum melanjutkan.`;
});

function openConfirmation() {
  showConfirmation.value = true;
}

async function submitOrder() {
  showConfirmation.value = false;
  loading.value = true;
  error.value = "";
  clearFieldErrors();
  try {
    const { data } = await api.post("/public/checkout", {
      ...form,
      plan: "lifetime",
      payment_method: "free",
    });
    registration.value = data.data;
    isComplete.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (requestError) {
    setFieldErrors(requestError.response?.data?.errors);
    error.value = getApiError(
      requestError,
      "Pendaftaran belum berhasil dikirim.",
    );
  } finally {
    loading.value = false;
  }
}

function clearFieldError(field) {
  delete fieldErrors[field];
}

function clearFieldErrors() {
  Object.keys(fieldErrors).forEach((field) => delete fieldErrors[field]);
}

function setFieldErrors(errors = []) {
  errors.forEach(({ field, message }) => {
    if (field && message) fieldErrors[field] = message;
  });
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--bg-primary);
}
.checkout-header {
  border-bottom: 1px solid var(--border-color);
  background: var(--surface);
}
.checkout-nav {
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 800;
}
.brand span {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border-radius: 6px;
  background: var(--accent-primary);
  color: var(--accent-contrast);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 700;
}
.back-link:hover {
  color: var(--accent-primary);
}
.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 345px;
  gap: 70px;
  padding-top: 58px;
  padding-bottom: 72px;
}
.checkout-main {
  min-width: 0;
}
.checkout-heading {
  max-width: 620px;
}
.eyebrow,
.summary-kicker {
  color: var(--accent-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.checkout-heading h1 {
  margin: 8px 0 10px;
  font-size: clamp(1.85rem, 3vw, 2.7rem);
}
.checkout-heading p:last-child {
  color: var(--text-secondary);
}
.step-indicator {
  display: flex;
  gap: 20px;
  margin: 31px 0 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}
.step-indicator .active {
  color: var(--accent-primary);
}
.checkout-form {
  display: grid;
  gap: 26px;
}
.checkout-form fieldset {
  padding: 0;
  border: 0;
}
.checkout-form legend {
  margin-bottom: 13px;
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 800;
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.field {
  display: grid;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}
.field.full {
  grid-column: 1 / -1;
}
.field input,
.field select {
  width: 100%;
  min-height: 42px;
  padding: 9px 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  outline: none;
  background: var(--surface);
  color: var(--text-primary);
}
.field input:focus,
.field select:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.field.invalid input,
.field.invalid select {
  border-color: var(--danger);
}
.field.invalid input:focus,
.field.invalid select:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 16%, transparent);
}
.field-error {
  color: var(--danger);
  font-size: 0.78rem;
  font-weight: 700;
}
.submit-button {
  justify-self: start;
}
.order-summary {
  position: sticky;
  top: 86px;
  align-self: start;
  padding: 23px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 7px 7px 0 var(--accent-soft);
}
.order-summary h2 {
  margin: 7px 0;
  font-size: 1.25rem;
}
.summary-text {
  color: var(--text-secondary);
  font-size: 0.84rem;
}
.order-summary ul {
  display: grid;
  gap: 9px;
  margin: 22px 0;
}
.order-summary li {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 0.77rem;
}
.order-summary li svg {
  color: var(--accent-primary);
}
.price-summary {
  display: grid;
  gap: 2px;
  padding: 15px 0;
  border-block: 1px solid var(--border-color);
}
.price-summary span {
  color: var(--text-secondary);
  font-size: 0.75rem;
}
.price-summary strong {
  font-family: var(--font-display);
  font-size: 1.55rem;
}
.price-summary small {
  color: var(--text-muted);
  font-size: 0.72rem;
}
.summary-footnote {
  display: flex;
  gap: 6px;
  margin-top: 16px;
  color: var(--text-muted);
  font-size: 0.72rem;
}
.summary-footnote svg {
  flex: 0 0 auto;
  color: var(--accent-primary);
}
.success-panel {
  max-width: 620px;
  margin-top: 30px;
  padding: 28px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface);
}
.success-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  background: #d9f0e4;
  color: var(--success);
}
.success-panel h2 {
  margin: 18px 0 8px;
  font-size: 1.45rem;
}
.success-panel > p {
  color: var(--text-secondary);
}
.registration-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 22px 0 14px;
  padding: 13px;
  background: var(--surface-subtle);
  color: var(--text-secondary);
  font-size: 0.78rem;
}
.registration-meta strong {
  color: var(--text-primary);
}
.whatsapp-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 7px;
  min-height: 45px;
  padding: 9px 12px;
  border-radius: 6px;
  background: #1f9d59;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
}
.whatsapp-action span {
  opacity: 0.86;
}
.return-home {
  display: block;
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}
.return-home:hover {
  color: var(--accent-primary);
}
@media (max-width: 1000px) {
  .checkout-layout {
    gap: 40px;
  }
}
@media (max-width: 880px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 34px;
  }
  .order-summary {
    position: static;
    grid-row: 1;
    width: min(560px, 100%);
  }
}
@media (max-width: 560px) {
  .checkout-nav {
    min-height: 58px;
  }
  .checkout-layout {
    padding-top: 38px;
    padding-bottom: 48px;
  }
  .field-grid {
    grid-template-columns: 1fr;
  }
  .field.full {
    grid-column: auto;
  }
  .submit-button {
    width: 100%;
  }
  .step-indicator {
    gap: 12px;
    font-size: 0.7rem;
  }
  .success-panel {
    padding: 22px;
  }
  .whatsapp-action {
    text-align: center;
  }
}
</style>
