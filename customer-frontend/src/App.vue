<template>
  <router-view />
</template>

<script setup>
import { watch } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore } from "./stores/theme";
import { updateSeo } from "./utils/seo";

useThemeStore();
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    const seo = route.meta.seo || {};
    updateSeo({ ...seo, path: route.path });
  },
  { immediate: true },
);
</script>
