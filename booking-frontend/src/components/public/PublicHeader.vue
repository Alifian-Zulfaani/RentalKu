<template>
  <header class="site-header" @keydown.esc="menuOpen = false">
    <div class="wrap header-inner public-header-inner">
      <a :href="homeHref" class="wordmark">
        <BrandMark :name="name" />
      </a>
      <nav
        id="public-navigation"
        :class="{ 'is-open': menuOpen }"
        aria-label="Navigasi utama"
      >
        <router-link to="/" @click="menuOpen = false">Beranda</router-link>
        <router-link to="/bio" @click="menuOpen = false">Bio</router-link>
        <router-link to="/portofolio" @click="menuOpen = false"
          >Portofolio</router-link
        >
      </nav>
      <ThemeToggle />
      <button
        type="button"
        class="public-menu-toggle"
        aria-label="Menu navigasi"
        aria-controls="public-navigation"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Menu, X } from "lucide-vue-next";
import BrandMark from "../shared/BrandMark.vue";
import ThemeToggle from "../shared/ThemeToggle.vue";

const route = useRoute();
const menuOpen = ref(false);
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);

defineProps({
  name: { type: String, default: "Studio Senja" },
  homeHref: { type: String, default: "/" },
});
</script>
