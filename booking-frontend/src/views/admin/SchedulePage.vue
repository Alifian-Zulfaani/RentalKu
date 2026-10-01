<template>
  <section class="admin-panel">
    <p class="section-index">03 — JAM KERJA</p>
    <h2>Jadwal mingguan fotografer</h2>
    <div
      v-for="person in professionals"
      :key="person.id"
      class="schedule-person"
    >
      <h3>{{ person.name }}</h3>
      <div class="schedule-list">
        <label v-for="(day, index) in weekdays" :key="day"
          ><input
            type="checkbox"
            :checked="Boolean(scheduleDrafts[person.id]?.[index])"
            @change="toggleDay(person.id, index, $event.target.checked)" />{{
            day
          }}<template v-if="scheduleDrafts[person.id]?.[index]"
            ><input
              type="time"
              v-model="scheduleDrafts[person.id][index].start_time" /><span
              >–</span
            ><input
              type="time"
              v-model="scheduleDrafts[person.id][index].end_time" /></template
        ></label>
      </div>
      <button
        type="button"
        class="button primary"
        @click="saveSchedule(person.id)"
      >
        Simpan jam kerja
      </button>
    </div>
  </section>
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
const { professionals, scheduleDrafts, weekdays, toggleDay, saveSchedule } =
  useAdminContext();
</script>
