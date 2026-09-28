<template>
  <header class="site-header" :class="{ compact: scrolled }">
    <div class="container nav-inner">
      <router-link
        to="/"
        class="brand"
        :aria-label="`${config.business_name || 'RentalKu Outdoor'} — Beranda`"
        @click="closeMenu"
      >
        <BrandMark
          :name="config.business_name || 'RentalKu Outdoor'"
          :logo-url="config.logo_url"
          descriptor="Outdoor gear rental"
        />
      </router-link>

      <nav
        class="nav-links"
        :class="{ open: menuOpen }"
        aria-label="Navigasi utama"
      >
        <router-link to="/#katalog" @click="closeMenu">Katalog</router-link>
        <router-link to="/#tentang" @click="closeMenu">Tentang</router-link>
        <router-link to="/sewa" @click="closeMenu"
          >Sewa perlengkapan</router-link
        >
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
        <router-link to="/admin/login" class="admin-link hide-mobile"
          >Masuk admin</router-link
        >
        <router-link to="/sewa" class="btn btn-primary btn-sm hide-mobile"
          >Cek ketersediaan <ArrowUpRight :size="16"
        /></router-link>
        <button
          class="icon-button menu-button hide-desktop"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Buka menu"
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
import BrandMark from "../shared/BrandMark.vue";

defineProps({ config: { type: Object, required: true } });
const themeStore = useThemeStore();
const menuOpen = ref(false);
const scrolled = ref(false);
const themeLabel = computed(() =>
  themeStore.isDark ? "Gunakan mode terang" : "Gunakan mode gelap",
);
const onScroll = () => {
  scrolled.value = window.scrollY > 12;
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
  border-bottom: 1px solid transparent;
  background: color-mix(in srgb, var(--bg-primary) 92%, transparent);
  backdrop-filter: blur(12px);
}
.site-header.compact {
  border-color: var(--border-color);
}
.nav-inner {
  display: flex;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
}
.brand {
  min-width: 170px;
  color: var(--text-primary);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  color: var(--text-secondary);
  font-size: 0.89rem;
  font-weight: 600;
}
.nav-links a:hover,
.admin-link:hover {
  color: var(--brand-primary);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 11px;
}
.admin-link {
  color: var(--text-secondary);
  font-size: 0.87rem;
  font-weight: 700;
}
.icon-button {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
}
.icon-button:hover {
  border-color: var(--border-strong);
  background: var(--surface-subtle);
}
@media (max-width: 768px) {
  .nav-inner {
    min-height: 66px;
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
    border-radius: var(--radius-lg);
    background: var(--surface-raised);
    box-shadow: var(--shadow-lg);
  }
  .nav-links.open {
    display: flex;
  }
  .nav-links a {
    padding: 12px;
  }
}
</style>
