<template>
  <PublicPageShell
    :name="site?.tenant.name"
    :location="site?.tenant.location"
    :email="site?.tenant.email"
    :phone="site?.tenant.whatsapp"
  >
    <div v-if="error" class="wrap state-message" role="alert">{{ error }}</div>
    <div v-else-if="!site" class="wrap state-message">
      Menyiapkan profil studio…
    </div>
    <section v-else class="wrap section studio-bio">
      <div class="studio-bio-copy">
        <p class="section-index">STUDIO SENJA / BIO</p>
        <h1>{{ site.tenant.tagline }}</h1>
        <p>{{ site.tenant.about }}</p>
        <router-link to="/#reservasi" class="button primary"
          >Reservasi sesi <ArrowUpRight :size="17"
        /></router-link>
      </div>
      <img
        :src="site.tenant.hero_image_url || '/images/studio-senja-hero.png'"
        :alt="`Suasana ${site.tenant.name}`"
      />
    </section>
    <section v-if="site?.tenant.philosophy_title" class="studio-philosophy">
      <div class="wrap studio-philosophy-inner">
        <figure class="studio-philosophy-visual">
          <img
            :src="
              site.portfolio?.[2]?.image_url ||
              site.portfolio?.[0]?.image_url ||
              site.tenant.hero_image_url ||
              '/images/studio-senja-hero.png'
            "
            alt="Salah satu karya fotografi Studio Senja"
            loading="lazy"
          />
          <figcaption>
            Studio Senja <span>—</span> {{ site.tenant.location }}
          </figcaption>
        </figure>
        <div class="studio-philosophy-copy">
          <p class="section-index">CARA KAMI MELIHAT CERITA</p>
          <h2>{{ site.tenant.philosophy_title }}</h2>
          <p>{{ site.tenant.philosophy_body }}</p>
          <div class="studio-philosophy-footer">
            <router-link to="/portofolio"
              >Jelajahi karya kami <ArrowUpRight :size="17"
            /></router-link>
          </div>
        </div>
      </div>
    </section>
  </PublicPageShell>
</template>
<script setup>
import { ArrowUpRight } from "lucide-vue-next";
import PublicPageShell from "../../components/public/PublicPageShell.vue";
import { useStudioPage } from "../../composables/useStudioPage";
const { site, error } = useStudioPage("Bio studio");
</script>
