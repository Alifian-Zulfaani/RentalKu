<template>
  <section class="admin-panel">
    <p class="section-index">06 — IDENTITAS</p>
    <h2>Profil studio</h2>
    <form class="site-form" @submit.prevent="saveSite">
      <label>Nama studio<input v-model.trim="siteForm.name" required /></label
      ><label>Tagline<input v-model.trim="siteForm.tagline" required /></label
      ><label>Lokasi<input v-model.trim="siteForm.location" required /></label
      ><label
        >Email<input
          v-model.trim="siteForm.email"
          type="email"
          required /></label
      ><label>WhatsApp<input v-model.trim="siteForm.whatsapp" required /></label
      ><label
        >URL foto hero (HTTPS atau /images/)<input
          v-model.trim="siteForm.hero_image_url"
          placeholder="/images/studio-senja-hero.png" /></label
      ><label class="wide"
        >Tentang studio<textarea
          v-model.trim="siteForm.about"
          rows="4"
          required
        ></textarea></label
      ><button type="submit" class="button primary">
        Simpan profil studio
      </button>
    </form>
  </section>
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
const { siteForm, saveSite } = useAdminContext();
</script>
