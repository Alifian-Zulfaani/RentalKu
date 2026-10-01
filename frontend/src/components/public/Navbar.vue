<template>
  <header class="site-header" :class="{ compact: isScrolled }">
    <div class="container nav-inner">
      <router-link to="/" class="brand" aria-label="RentalKu">
        <span class="brand-mark">R.</span>
        <span>RentalKu</span>
      </router-link>
      <nav
        class="nav-links"
        :class="{ open: menuOpen }"
        aria-label="Navigasi utama"
      >
        <a href="#produk" @click="closeMenu">Produk</a>
        <a href="#cara-kerja" @click="closeMenu">Cara kerja</a>
        <a href="#harga" @click="closeMenu">Harga</a>
        <a href="#faq" @click="closeMenu">FAQ</a>
        <router-link to="/order" class="mobile-cta" @click="closeMenu">Daftar gratis <ArrowUpRight :size="16" /></router-link>
      </nav>
      <div class="nav-actions">
        <button
          class="icon-button"
          type="button"
          :aria-label="themeLabel"
          @click="themeStore.toggleTheme"
        >
          <Sun v-if="themeStore.isDark" :size="18" />
          <Moon v-else :size="18" />
        </button>
        <router-link to="/order" class="btn btn-primary btn-sm desktop-cta"
          >Daftar gratis <ArrowUpRight :size="16"
        /></router-link>
        <button
          class="icon-button menu-button"
          type="button"
          :aria-label="menuOpen ? 'Tutup menu' : 'Buka menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <Menu v-if="!menuOpen" :size="20" />
          <X v-else :size="20" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-vue-next";
import { useThemeStore } from "../../stores/theme";

const themeStore = useThemeStore();
const menuOpen = ref(false);
const isScrolled = ref(false);
const themeLabel = computed(() =>
  themeStore.isDark ? "Gunakan mode terang" : "Gunakan mode gelap",
);
const onScroll = () => {
  isScrolled.value = window.scrollY > 12;
};
const closeMenu = () => {
  menuOpen.value = false;
};

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--bg-primary) 92%, transparent);
  border-bottom: 1px solid transparent;
  backdrop-filter: blur(12px);
}
.site-header.compact {
  border-color: var(--border-color);
}
.nav-inner {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.1rem;
}
.brand-mark {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 6px;
  background: var(--accent-primary);
  color: var(--accent-contrast);
  font-family: var(--font-display);
  font-weight: 800;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 26px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
}
.nav-links a:hover {
  color: var(--accent-primary);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mobile-cta { display: none; }
.icon-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-primary);
}
.icon-button:hover {
  border-color: var(--border-strong);
  background: var(--surface-subtle);
}
.menu-button {
  display: none;
}
@media (max-width: 960px) {
  .nav-inner {
    min-height: 62px;
  }
  .desktop-cta { display: none; }
  .menu-button {
    display: grid;
  }
  .nav-links {
    position: absolute;
    top: calc(100% + 8px);
    right: 16px;
    left: 16px;
    display: none;
    padding: 10px;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--surface-raised);
    box-shadow: var(--shadow-lg);
  }
  .nav-links.open {
    display: flex;
  }
  .nav-links a {
    padding: 12px;
  }
  .nav-links .mobile-cta {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    border-radius: 5px;
    background: var(--accent-primary);
    color: var(--accent-contrast);
  }
}
</style>
