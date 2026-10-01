<template>
  <div class="admin-page-stack">
    <section class="page-intro-panel">
      <div>
        <p class="section-index">KALENDER OPERASIONAL</p>
        <h2>Jadwal & ketersediaan</h2>
        <p>Atur jam kerja rutin dan pengecualian jadwal dari satu tempat.</p>
      </div>
    </section>
    <div class="admin-tabs" role="tablist" aria-label="Pengaturan jadwal">
      <button
        type="button"
        :class="{ active: tab === 'blocks' }"
        @click="tab = 'blocks'"
      >
        Blokir waktu
      </button>
      <button
        type="button"
        :class="{ active: tab === 'hours' }"
        @click="tab = 'hours'"
      >
        Jam kerja mingguan
      </button>
    </div>
    <BlocksPage v-if="tab === 'blocks'" />
    <SchedulePage v-else />
  </div>
</template>

<script setup>
import { ref } from "vue";
import BlocksPage from "./BlocksPage.vue";
import SchedulePage from "./SchedulePage.vue";
const tab = ref("blocks");
</script>
