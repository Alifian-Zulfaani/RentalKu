<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? 'Gunakan mode terang' : 'Gunakan mode gelap'"
    :title="isDark ? 'Gunakan mode terang' : 'Gunakan mode gelap'"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" :size="18" />
    <Moon v-else :size="18" />
  </button>
</template>

<script setup>
import { Moon, Sun } from "lucide-vue-next";
import { useThemeStore } from "../../stores/theme";

const { isDark, toggleTheme } = useThemeStore();
</script>
