<template>
  <nav class="navbar" :class="{ scrolled }">
    <div class="container nav-container">
      <div class="brand">
        <img
          v-if="config.logo_url"
          :src="config.logo_url"
          alt="Logo"
          class="logo"
        />
        <span
          v-else
          class="brand-text"
          :style="{ color: config.primary_color }"
          >{{ config.business_name || "My Rental" }}</span
        >
      </div>
      <div class="nav-links hide-mobile">
        <a href="#katalog">Katalog Produk</a>
        <a href="#tentang">Tentang Kami</a>
      </div>
      <div class="nav-actions">
        <button
          class="theme-toggle"
          @click="themeStore.toggleTheme"
          aria-label="Toggle theme"
        >
          <Sun v-if="themeStore.isDark" :size="20" />
          <Moon v-else :size="20" />
        </button>
        <a
          href="#booking"
          class="btn btn-primary btn-sm"
          :style="{ background: config.primary_color }"
          >Booking Sekarang</a
        >
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Sun, Moon } from "lucide-vue-next";
import { useThemeStore } from "../../stores/theme";

const themeStore = useThemeStore();
defineProps({ config: Object });
const scrolled = ref(false);

function handleScroll() {
  scrolled.value = window.scrollY > 50;
}
onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  z-index: 100;
  transition: all 0.3s;
  border-bottom: 1px solid transparent;
}
.navbar.scrolled {
  background: var(--bg-surface);
  border-color: var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.nav-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.logo {
  height: 40px;
}
.nav-links {
  display: flex;
  gap: 32px;
}
.nav-links a {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
}
.nav-links a:hover {
  color: var(--text-primary);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
}
.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--brand-primary);
}
@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
}
</style>
