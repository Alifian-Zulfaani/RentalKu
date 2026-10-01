<template>
  <section class="admin-panel">
    <p class="section-index">PAKET PER FOTOGRAFER</p>
    <h2>Harga & layanan</h2>
    <p class="panel-description">
      Tentukan paket aktif dan harga yang tampil di halaman masing-masing
      fotografer.
    </p>
    <label v-if="isCompany" class="offering-select"
      >Fotografer<select v-model.number="selectedOfferingPro">
        <option
          v-for="person in professionals"
          :key="person.id"
          :value="person.id"
        >
          {{ person.name }}
        </option>
      </select></label
    >
    <div class="offering-list">
      <div v-for="item in offerings" :key="item.service_id">
        <span
          ><strong>{{ item.name }}</strong
          ><small
            >{{ item.duration_minutes }} menit · harga dasar
            {{ money(item.base_price) }}</small
          ></span
        ><label
          >Harga<input
            v-model.number="item.price"
            type="number"
            min="0"
            step="1000" /></label
        ><label class="check-label"
          ><input
            v-model="item.active"
            type="checkbox"
            :true-value="1"
            :false-value="0"
          />
          Aktif</label
        >
      </div>
    </div>
    <p v-if="!offerings.length" class="empty-time">
      Belum ada paket untuk dipilih.
    </p>
    <button
      v-if="offerings.length"
      class="button primary"
      type="button"
      @click="saveOfferings"
    >
      Simpan paket & harga
    </button>
  </section>
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
const {
  money,
  professionals,
  isCompany,
  offerings,
  selectedOfferingPro,
  saveOfferings,
} = useAdminContext();
</script>
