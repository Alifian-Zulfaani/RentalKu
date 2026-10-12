<template>
  <section id="karya" class="wrap section portfolio-section">
    <div class="section-top portfolio-heading">
      <div>
        <p class="section-index">02 — KARYA STUDIO</p>
        <h2>Cerita yang kami simpan.</h2>
        <p>
          Setiap sesi punya suasananya sendiri. Lihat sekilas arah karya Studio
          Senja.
        </p>
      </div>
      <router-link to="/portofolio" class="button secondary"
        >Lihat semua karya <ArrowUpRight :size="17"
      /></router-link>
    </div>
    <PortfolioGallery v-if="items.length" :items="items.slice(0, 3)" />
    <p v-else class="portfolio-empty">Karya studio akan hadir di sini.</p>
  </section>
</template>

<script setup>
import { ArrowUpRight } from "lucide-vue-next";
import PortfolioGallery from "./PortfolioGallery.vue";
defineProps({ items: { type: Array, default: () => [] } });
</script>
