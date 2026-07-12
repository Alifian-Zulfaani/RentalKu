<template>
  <div class="landing-page" v-if="config">
    <Navbar :config="config" />
    <HeroSection :config="config" />
    <CatalogSection :config="config" :products="products" :categories="categories" />
    <AboutSection :config="config" />
    <BookingSection :config="config" :products="products" />
    <FooterSection :config="config" />
    <ScrollToTop />
  </div>
  <div v-else class="loading-state">
    <div class="loader"></div>
    <p>Memuat Data Website...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import Navbar from '../../components/public/Navbar.vue'
import HeroSection from '../../components/public/HeroSection.vue'
import CatalogSection from '../../components/public/CatalogSection.vue'
import AboutSection from '../../components/public/AboutSection.vue'
import BookingSection from '../../components/public/BookingSection.vue'
import FooterSection from '../../components/public/FooterSection.vue'
import ScrollToTop from '../../components/public/ScrollToTop.vue'

const config = ref(null)
const products = ref([])
const categories = ref([])

onMounted(async () => {
  try {
    const [cfgRes, prodRes, catRes] = await Promise.all([
      api.get('/public/config'),
      api.get('/public/products'),
      api.get('/public/categories')
    ])
    config.value = cfgRes.data
    products.value = prodRes.data
    categories.value = catRes.data
    document.title = config.value.business_name + ' - ' + config.value.tagline
    
    // Set dynamic CSS variables for theme
    document.documentElement.style.setProperty('--brand-primary', config.value.primary_color)
    document.documentElement.style.setProperty('--brand-secondary', config.value.secondary_color)
  } catch (err) {
    console.error('Failed to load landing page data', err)
  }
})
</script>

<style scoped>
.loading-state { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-secondary); }
.loader { width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--brand-primary, #16a34a); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
