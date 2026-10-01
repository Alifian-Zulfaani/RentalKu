<template>
  <div class="landing-page" v-if="config">
    <Navbar :config="config" />
    <HeroSection
      :config="config"
      :products="products"
      :categories="categories"
    />
    <CatalogSection
      :config="config"
      :products="products"
      :categories="categories"
    />
    <AboutSection :config="config" />
    <FooterSection :config="config" />
    <WhatsAppContact :config="config" />
    <ScrollToTop />
  </div>
  <div v-else-if="loading" class="loading-state">
    <div class="loader"></div>
    <p>Menyiapkan katalog...</p>
  </div>
  <div v-else class="loading-state error-state">
    <CircleAlert :size="36" />
    <h1>Website belum dapat dimuat</h1>
    <p>{{ errorMessage }}</p>
    <button class="btn btn-primary" type="button" @click="loadPage">
      Coba lagi
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { CircleAlert } from "lucide-vue-next";
import api from "../../services/api";
import Navbar from "../../components/public/Navbar.vue";
import HeroSection from "../../components/public/HeroSection.vue";
import CatalogSection from "../../components/public/CatalogSection.vue";
import AboutSection from "../../components/public/AboutSection.vue";
import FooterSection from "../../components/public/FooterSection.vue";
import ScrollToTop from "../../components/public/ScrollToTop.vue";
import WhatsAppContact from "../../components/public/WhatsAppContact.vue";
import { getApiError } from "../../utils/formatters";
import { updateSeo } from "../../utils/seo";

const config = ref(null);
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const errorMessage = ref("");

async function loadPage() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const [cfgRes, prodRes, catRes] = await Promise.all([
      api.get("/public/config"),
      api.get("/public/products"),
      api.get("/public/categories"),
    ]);
    config.value = cfgRes.data;
    products.value = prodRes.data;
    categories.value = catRes.data;
    updateSeo({
      title: `${config.value.business_name || "Rental"} | ${config.value.tagline || "Sewa Peralatan"}`,
      description:
        config.value.description ||
        config.value.hero_subtitle ||
        config.value.tagline,
      path: "/",
      favicon: config.value.logo_url || "/favicon.svg?v=3",
    });

    // Set dynamic CSS variables for theme
    document.documentElement.style.setProperty(
      "--brand-primary",
      /^#[0-9a-f]{6}$/i.test(config.value.primary_color)
        ? config.value.primary_color
        : "#2f5948",
    );
    document.documentElement.style.setProperty(
      "--brand-secondary",
      /^#[0-9a-f]{6}$/i.test(config.value.secondary_color)
        ? config.value.secondary_color
        : "#c66e46",
    );
  } catch (err) {
    errorMessage.value = getApiError(
      err,
      "Koneksi ke layanan katalog terputus. Periksa backend lalu coba lagi.",
    );
  } finally {
    loading.value = false;
  }
}

onMounted(loadPage);
</script>

<style scoped>
.loading-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}
.error-state {
  padding: 24px;
  text-align: center;
}
.error-state h1 {
  font-size: 1.5rem;
}
.error-state p {
  max-width: 520px;
}
.error-state svg {
  color: var(--danger);
}
.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--brand-primary, #2f5948);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
