<template>
  <div class="dashboard">
    <div class="stats-row">
      <div class="stat-card glass-card" v-for="(s, i) in statCards" :key="i">
        <div class="stat-card-icon" :style="{ background: s.bg }">
          <component :is="s.icon" :size="22" :color="s.color" />
        </div>
        <div class="stat-card-info">
          <div class="stat-card-value">
            {{ s.format ? s.format(stats[s.key]) : stats[s.key] }}
          </div>
          <div class="stat-card-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
    <div class="recent-section glass-card">
      <div class="section-header">
        <h3>Subscriber Terbaru</h3>
        <router-link to="/admin/subscribers" class="btn btn-secondary btn-sm"
          >Lihat Semua</router-link
        >
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Bisnis</th>
              <th>Plan</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in stats.recentSubscribers" :key="s.id">
              <td>
                <strong>{{ s.name }}</strong>
              </td>
              <td>{{ s.business_name || "-" }}</td>
              <td>
                <span class="badge badge-info">{{ s.plan }}</span>
              </td>
              <td>{{ formatRp(s.amount) }}</td>
              <td>
                <span class="badge" :class="'badge-' + statusColor(s.status)">{{
                  s.status
                }}</span>
              </td>
              <td>{{ formatDate(s.created_at) }}</td>
            </tr>
            <tr v-if="!stats.recentSubscribers?.length">
              <td colspan="6" class="text-center text-muted">
                Belum ada subscriber
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import api from "../../services/api";
import { Users, UserCheck, Clock, DollarSign } from "lucide-vue-next";

const stats = reactive({
  totalSubscribers: 0,
  confirmed: 0,
  pending: 0,
  rejected: 0,
  totalRevenue: 0,
  recentSubscribers: [],
});

const statCards = [
  {
    key: "totalSubscribers",
    label: "Total Subscriber",
    icon: Users,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
  },
  {
    key: "confirmed",
    label: "Subscriber Aktif",
    icon: UserCheck,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    key: "pending",
    label: "Menunggu Konfirmasi",
    icon: Clock,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    key: "totalRevenue",
    label: "Total Pendapatan",
    icon: DollarSign,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    format: (v) => formatRp(v),
  },
];

const formatRp = (v) => "Rp" + (v || 0).toLocaleString("id-ID");
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })
    : "-";
const statusColor = (s) =>
  ({ pending: "warning", confirmed: "success", rejected: "danger" })[s] ||
  "default";

onMounted(async () => {
  try {
    const { data } = await api.get("/subscribers/stats");
    Object.assign(stats, data);
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
}
.stat-card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-card-value {
  font-size: 1.5rem;
  font-weight: 800;
}
.stat-card-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 2px;
}
.recent-section {
  padding: 24px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-header h3 {
  font-size: 1.1rem;
}
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  text-align: left;
  padding: 14px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}
.data-table td {
  padding: 14px 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
}
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .stat-card {
    padding: 16px;
  }
  .stat-card-value {
    font-size: 1.2rem;
  }
}
</style>
