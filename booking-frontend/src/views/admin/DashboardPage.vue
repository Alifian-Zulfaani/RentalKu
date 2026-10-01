<template>
  <div class="admin-page-stack">
    <section class="page-intro-panel dashboard-intro">
      <div>
        <p class="section-index">RINGKASAN OPERASIONAL</p>
        <h2>Aktivitas studio hari ini</h2>
        <p>
          Pantau reservasi yang masuk dan tindak lanjut yang masih menunggu.
        </p>
      </div>
      <router-link to="/admin/bookings" class="button primary">
        Lihat reservasi
      </router-link>
    </section>
    <div class="admin-grid">
      <article class="admin-card">
        <span class="metric-icon"><CalendarClock :size="19" /></span
        ><span>Total reservasi</span
        ><strong>{{ overview.counts.total || 0 }}</strong
        ><small>Semua sesi tercatat</small>
      </article>
      <article class="admin-card">
        <span class="metric-icon"><Clock3 :size="19" /></span
        ><span>Menunggu konfirmasi</span
        ><strong>{{ overview.counts.pending || 0 }}</strong
        ><small>Perlu ditindaklanjuti</small>
      </article>
      <article class="admin-card">
        <span class="metric-icon"><ShieldCheck :size="19" /></span
        ><span>Terkonfirmasi</span
        ><strong>{{ overview.counts.confirmed || 0 }}</strong
        ><small>Jadwal sudah disetujui</small>
      </article>
    </div>
    <section class="admin-panel">
      <div class="section-top">
        <div>
          <p class="section-index">AKTIVITAS TERBARU</p>
          <h2>Reservasi masuk</h2>
        </div>
        <router-link to="/admin/bookings" class="button secondary">
          Lihat semua
        </router-link>
      </div>
      <div v-if="overview.recent.length" class="recent-list">
        <div v-for="item in overview.recent" :key="item.id">
          <span
            ><strong>{{ item.customer_name }}</strong
            ><small
              >{{ item.service_name }} · {{ item.professional_name }}</small
            ></span
          ><span>{{ item.date }} · {{ item.start_time }}</span
          ><strong>{{ money(item.total) }}</strong>
        </div>
      </div>
      <p v-else class="empty-time">Belum ada reservasi.</p>
    </section>
  </div>
</template>

<script setup>
import { CalendarClock, Clock3, ShieldCheck } from "lucide-vue-next";
import { useAdminContext } from "../../stores/context";
const { overview, money } = useAdminContext();
</script>
