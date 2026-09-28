<template>
  <router-view />
  <template v-if="showPublicActions">
    <ScrollToTop />
    <WhatsAppContact />
  </template>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed, watch } from "vue";
import ScrollToTop from "./components/public/ScrollToTop.vue";
import WhatsAppContact from "./components/public/WhatsAppContact.vue";
import { updateSeo } from "./utils/seo";

const route = useRoute();
const showPublicActions = computed(() => !route.path.startsWith("/admin"));

watch(route, updateSeo, { immediate: true });
</script>
