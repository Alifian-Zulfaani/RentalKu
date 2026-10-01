<template>
  <div v-if="config" class="rental-page">
    <Navbar :config="config" />
    <BookingSection
      :config="config"
      :products="products"
      :categories="categories"
      @booked="loadData"
    />
    <FooterSection :config="config" />
    <WhatsAppContact :config="config" />
    <ScrollToTop />
  </div>
  <div v-else class="loading-state">
    <div v-if="loading" class="loader"></div>
    <CircleAlert v-else :size="34" />
    <p>{{ loading ? "Menyiapkan katalog..." : errorMessage }}</p>
    <button v-if="!loading" class="btn btn-primary" @click="loadData">
      Coba lagi
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { CircleAlert } from "lucide-vue-next";
import api from "../../services/api";
import Navbar from "../../components/public/Navbar.vue";
import BookingSection from "../../components/public/BookingSection.vue";
import FooterSection from "../../components/public/FooterSection.vue";
import WhatsAppContact from "../../components/public/WhatsAppContact.vue";
import ScrollToTop from "../../components/public/ScrollToTop.vue";
import { getApiError } from "../../utils/formatters";
import { updateSeo } from "../../utils/seo";

const config = ref(null);
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const errorMessage = ref("");
async function loadData() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const [cfg, prod, cat] = await Promise.all([
      api.get("/public/config"),
      api.get("/public/products"),
      api.get("/public/categories"),
    ]);
    config.value = cfg.data;
    products.value = prod.data;
    categories.value = cat.data;
    updateSeo({
      title: `Sewa Perlengkapan | ${config.value.business_name}`,
      description:
        "Pilih perlengkapan outdoor, atur jumlah, dan kirim booking dalam dua langkah.",
      path: "/sewa",
      favicon: config.value.logo_url || "/favicon.svg?v=3",
    });
  } catch (error) {
    errorMessage.value = getApiError(error, "Halaman sewa belum dapat dimuat.");
  } finally {
    loading.value = false;
  }
}
onMounted(loadData);
</script>

<style scoped>
.loading-state {
  display: grid;
  min-height: 100vh;
  padding: 24px;
  place-content: center;
  justify-items: center;
  gap: 14px;
  color: var(--text-secondary);
  text-align: center;
}
.loader {
  width: 38px;
  height: 38px;
  border: 3px solid var(--border-color);
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
