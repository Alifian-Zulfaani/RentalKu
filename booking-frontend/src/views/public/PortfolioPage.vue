<template>
  <PublicPageShell
    :name="site?.tenant.name"
    :location="site?.tenant.location"
    :email="site?.tenant.email"
    :phone="site?.tenant.whatsapp"
  >
    <div v-if="error" class="wrap state-message" role="alert">{{ error }}</div>
    <div v-else-if="!site" class="wrap state-message">
      Menyiapkan karya studio…
    </div>
    <section v-else class="wrap section portfolio-section portfolio-page">
      <div class="section-top portfolio-heading">
        <div>
          <p class="section-index">STUDIO SENJA / PORTOFOLIO</p>
          <h1>Yang tertinggal setelah sesi.</h1>
          <p>Pilihan suasana dan pendekatan visual Studio Senja.</p>
        </div>
        <router-link to="/#reservasi" class="button primary"
          >Reservasi sesi <ArrowUpRight :size="17"
        /></router-link>
      </div>
      <PortfolioGallery v-if="site.portfolio.length" :items="site.portfolio" />
      <p v-else class="portfolio-empty">Karya studio akan hadir di sini.</p>
    </section>
  </PublicPageShell>
</template>
<script setup>
import { ArrowUpRight } from "lucide-vue-next";
import PublicPageShell from "../../components/public/PublicPageShell.vue";
import PortfolioGallery from "../../components/public/PortfolioGallery.vue";
import { useStudioPage } from "../../composables/useStudioPage";
const { site, error } = useStudioPage("Portofolio");
</script>
