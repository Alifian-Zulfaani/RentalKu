<template>
  <div class="dashboard-page">
    <section class="page-intro">
      <div>
        <p class="page-kicker">Ringkasan platform</p>
        <h2>Prioritas Anda hari ini</h2>
        <p>
          Review pendaftaran baru dan pantau pertumbuhan subscriber di satu
          tempat.
        </p>
      </div>
      <router-link
        to="/admin/subscribers?status=pending"
        class="btn btn-primary"
        >Tinjau pendaftaran <ArrowRight :size="17"
      /></router-link>
    </section>

    <div class="metric-grid">
      <article v-for="stat in statCards" :key="stat.key" class="metric-card">
        <div class="metric-icon" :class="stat.tone">
          <component :is="stat.icon" :size="19" />
        </div>
        <div>
          <p>{{ stat.label }}</p>
          <strong>{{
            stat.format ? stat.format(stats[stat.key]) : stats[stat.key]
          }}</strong
          ><small>{{ stat.note }}</small>
        </div>
      </article>
    </div>

    <section class="attention-panel">
      <div class="attention-copy">
        <span class="attention-icon"><Clock3 :size="20" /></span>
        <div>
          <strong>{{ stats.pending }} pendaftaran menunggu keputusan</strong>
          <p>
            Setiap persetujuan membuat bisnis rental siap masuk ke proses
            onboarding.
          </p>
        </div>
      </div>
      <router-link
        to="/admin/subscribers?status=pending"
        class="btn btn-secondary btn-sm"
        >Buka antrean</router-link
      >
    </section>

    <section class="recent-panel">
      <div class="panel-header">
        <div>
          <h3>Subscriber terbaru</h3>
          <p>Pendaftaran terakhir yang masuk ke platform.</p>
        </div>
        <router-link to="/admin/subscribers" class="panel-link"
          >Semua subscriber <ArrowUpRight :size="16"
        /></router-link>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bisnis & pemilik</th>
              <th>Metode</th>
              <th class="align-right">Nilai</th>
              <th>Status</th>
              <th>Tanggal daftar</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="subscriber in stats.recentSubscribers"
              :key="subscriber.id"
            >
              <td>
                <strong>{{
                  subscriber.business_name || subscriber.name
                }}</strong
                ><small>{{ subscriber.name }} · {{ subscriber.email }}</small>
              </td>
              <td>
                <span class="method-label">{{
                  subscriber.payment_method || "-"
                }}</span>
              </td>
              <td class="align-right">
                {{ formatCurrency(subscriber.amount) }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="`badge-${statusTone(subscriber.status)}`"
                  >{{ statusLabel(subscriber.status) }}</span
                >
              </td>
              <td>{{ formatDate(subscriber.created_at) }}</td>
            </tr>
            <tr v-if="!stats.recentSubscribers.length">
              <td colspan="5" class="empty-state">
                Belum ada subscriber yang terdaftar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <ToastMessage :message="error" type="error" @close="error = ''" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  DollarSign,
  UserCheck,
  Users,
} from "lucide-vue-next";
import api from "../../services/api";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import {
  formatCurrency,
  formatDate,
  getApiError,
} from "../../utils/formatters";

const stats = reactive({
  totalSubscribers: 0,
  confirmed: 0,
  pending: 0,
  rejected: 0,
  totalRevenue: 0,
  recentSubscribers: [],
});
const error = ref("");
const statCards = [
  {
    key: "totalSubscribers",
    label: "Total subscriber",
    note: "seluruh pendaftar",
    icon: Users,
    tone: "teal",
  },
  {
    key: "confirmed",
    label: "Subscriber aktif",
    note: "sudah dikonfirmasi",
    icon: UserCheck,
    tone: "green",
  },
  {
    key: "pending",
    label: "Menunggu review",
    note: "butuh keputusan",
    icon: Clock3,
    tone: "amber",
  },
  {
    key: "totalRevenue",
    label: "Pendapatan tercatat",
    note: "dari subscriber aktif",
    icon: DollarSign,
    tone: "coral",
    format: formatCurrency,
  },
];
const statusTone = (status) =>
  ({ pending: "warning", confirmed: "success", rejected: "danger" })[status] ||
  "default";
const statusLabel = (status) =>
  ({ pending: "Menunggu", confirmed: "Aktif", rejected: "Ditolak" })[status] ||
  status;

onMounted(async () => {
  try {
    const { data } = await api.get("/subscribers/stats");
    Object.assign(stats, data);
  } catch (requestError) {
    error.value = getApiError(
      requestError,
      "Ringkasan dashboard belum bisa dimuat.",
    );
  }
});
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 22px;
}
.page-intro,
.attention-panel,
.recent-panel {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface);
}
.page-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 26px;
}
.page-kicker {
  margin-bottom: 6px;
  color: var(--accent-primary);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.page-intro h2 {
  font-size: 1.55rem;
}
.page-intro p:not(.page-kicker) {
  margin-top: 7px;
  color: var(--text-secondary);
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.metric-card {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  min-height: 132px;
  padding: 19px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--surface);
}
.metric-icon {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  place-items: center;
  border-radius: 6px;
}
.metric-icon.teal {
  background: #d9eeea;
  color: #136b65;
}
.metric-icon.green {
  background: #d9f0e4;
  color: #157c55;
}
.metric-icon.amber {
  background: #f8e8c9;
  color: #a86410;
}
.metric-icon.coral {
  background: #f8dedb;
  color: #b7423a;
}
.metric-card p {
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
}
.metric-card strong {
  display: block;
  margin: 3px 0;
  font-family: var(--font-display);
  font-size: 1.4rem;
}
.metric-card small {
  color: var(--text-muted);
  font-size: 0.7rem;
}
.attention-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  background: var(--accent-soft);
  border-color: #b6ddd4;
}
.attention-copy {
  display: flex;
  align-items: center;
  gap: 12px;
}
.attention-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  color: var(--accent-primary);
  background: var(--surface);
}
.attention-copy strong {
  font-size: 0.88rem;
}
.attention-copy p {
  color: var(--text-secondary);
  font-size: 0.78rem;
}
.panel-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding: 21px 22px;
  border-bottom: 1px solid var(--border-color);
}
.panel-header h3 {
  font-size: 1.02rem;
}
.panel-header p {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 0.8rem;
}
.panel-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--accent-primary);
  font-size: 0.8rem;
  font-weight: 800;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 690px;
  border-collapse: collapse;
}
th {
  padding: 11px 22px;
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
  background: var(--surface-subtle);
}
td {
  padding: 14px 22px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
}
td strong,
td small {
  display: block;
}
td strong {
  color: var(--text-primary);
  font-size: 0.83rem;
}
td small {
  margin-top: 2px;
  color: var(--text-muted);
}
.align-right {
  text-align: right;
}
.method-label {
  color: var(--text-secondary);
  text-transform: capitalize;
}
.empty-state {
  padding: 32px;
  text-align: center;
}
@media (max-width: 1000px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 620px) {
  .page-intro,
  .attention-panel {
    align-items: stretch;
    flex-direction: column;
  }
  .page-intro .btn {
    width: 100%;
  }
  .metric-grid {
    grid-template-columns: 1fr;
  }
  .metric-card {
    min-height: auto;
  }
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
