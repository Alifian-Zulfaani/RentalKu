<template>
  <section class="admin-panel">
    <p class="section-index">JAM OPERASIONAL</p>
    <h2>Jadwal mingguan studio</h2>
    <div class="schedule-person">
      <p class="panel-description">
        Atur hari dan jam ketika studio menerima reservasi.
      </p>
      <div class="schedule-list">
        <label v-for="(day, index) in weekdays" :key="day"
          ><input
            type="checkbox"
            :checked="Boolean(studioSchedule[index])"
            @change="toggleStudioDay(index, $event.target.checked)" />{{ day
          }}<template v-if="studioSchedule[index]"
            ><input
              type="time"
              v-model="studioSchedule[index].start_time" /><span>–</span
            ><input
              type="time"
              v-model="studioSchedule[index].end_time" /></template
        ></label>
      </div>
      <button type="button" class="button primary" @click="saveStudioSchedule">
        Simpan jam operasional
      </button>
    </div>
  </section>
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
const { studioSchedule, weekdays, toggleStudioDay, saveStudioSchedule } =
  useAdminContext();
</script>
