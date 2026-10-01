<template>
  <div class="admin-page-stack">
    <section class="page-intro-panel">
      <div>
        <p class="section-index">PENGATURAN</p>
        <h2>{{ isCompany ? "Studio & akun" : "Akun saya" }}</h2>
        <p>
          Kelola informasi yang jarang berubah tanpa memenuhi navigasi utama.
        </p>
      </div>
    </section>
    <div class="admin-tabs" role="tablist" aria-label="Pengaturan admin">
      <button
        v-if="isCompany"
        type="button"
        :class="{ active: tab === 'studio' }"
        @click="tab = 'studio'"
      >
        Profil studio
      </button>
      <button
        v-if="isCompany"
        type="button"
        :class="{ active: tab === 'accounts' }"
        @click="tab = 'accounts'"
      >
        Akun tim
      </button>
      <button
        type="button"
        :class="{ active: tab === 'security' }"
        @click="tab = 'security'"
      >
        Keamanan
      </button>
    </div>
    <SiteSettingsPage v-if="isCompany && tab === 'studio'" />
    <AccountsPage v-else-if="isCompany && tab === 'accounts'" />
    <SecurityPage v-else />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAdminContext } from "../../stores/context";
import SiteSettingsPage from "./SiteSettingsPage.vue";
import AccountsPage from "./AccountsPage.vue";
import SecurityPage from "./SecurityPage.vue";
const { isCompany } = useAdminContext();
const tab = ref(isCompany.value ? "studio" : "security");
</script>
