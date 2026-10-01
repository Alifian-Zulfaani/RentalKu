<template>
  <div class="dashboard-page">
    <section class="page-intro">
      <div>
        <p class="page-kicker">Ringkasan pendaftaran</p>
        <h2>Pendaftaran terbaru</h2>
        <p>
          Pantau pendaftar Rental dan Booking, lalu tindak lanjuti yang masih menunggu.
        </p>
      </div>
      <router-link
        to="/admin/rental"
        class="btn btn-primary"
        >Lihat Rental <ArrowRight :size="17"
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

    <div class="product-overview">
      <router-link to="/admin/rental" class="product-overview-card"><span>APLIKASI RENTAL</span><strong>{{ stats.byProduct?.rental?.total || 0 }} pendaftar</strong><small>{{ stats.byProduct?.rental?.pending || 0 }} perlu ditinjau</small><ArrowUpRight :size="18" /></router-link>
      <router-link to="/admin/booking" class="product-overview-card"><span>APLIKASI BOOKING</span><strong>{{ stats.byProduct?.booking?.total || 0 }} pendaftar</strong><small>{{ stats.byProduct?.booking?.pending || 0 }} perlu ditinjau</small><ArrowUpRight :size="18" /></router-link>
    </div>

    <section class="attention-panel">
      <div class="attention-copy">
        <span class="attention-icon"><Clock3 :size="20" /></span>
        <div>
          <strong>{{ stats.pending }} pendaftaran perlu ditinjau</strong>
          <p>
            Periksa detail bisnis sebelum mengambil keputusan.
          </p>
        </div>
      </div>
      <div class="attention-actions">
        <router-link to="/admin/rental?status=pending" class="btn btn-secondary btn-sm">Lihat Rental</router-link>
        <router-link to="/admin/booking?status=pending" class="btn btn-secondary btn-sm">Lihat Booking</router-link>
      </div>
    </section>

    <section class="recent-panel">
      <div class="panel-header">
        <div>
          <h3>Pendaftar terbaru</h3>
          <p>Lima pendaftaran terakhir.</p>
        </div>
        <router-link to="/admin/booking" class="panel-link"
          >Lihat Booking <ArrowUpRight :size="16"
        /></router-link>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bisnis & pemilik</th>
              <th>Produk</th>
              <th>Akses</th>
              <th class="align-right">Biaya</th>
              <th class="align-center">Status</th>
              <th>Tanggal daftar</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="subscriber in stats.recentSubscribers"
              :key="subscriber.id"
              class="data-row"
            >
              <td data-label="Bisnis & pemilik">
                <strong>{{
                  subscriber.business_name || subscriber.name
                }}</strong
                ><small>{{ subscriber.name }} · {{ subscriber.email }}</small>
              </td>
              <td data-label="Produk">{{ subscriber.product_type === "booking" ? "Booking" : "Rental" }}</td>
              <td data-label="Akses">
                <span class="method-label">Early access</span>
              </td>
              <td class="align-right" data-label="Biaya">
                {{ formatCurrency(subscriber.amount) }}
              </td>
              <td class="align-center" data-label="Status">
                <span
                  class="badge"
                  :class="`badge-${statusTone(subscriber.status)}`"
                  >{{ statusLabel(subscriber.status) }}</span
                >
              </td>
              <td data-label="Tanggal daftar">{{ formatDate(subscriber.created_at) }}</td>
            </tr>
            <tr v-if="!stats.recentSubscribers.length">
              <td colspan="6" class="empty-state">
                Belum ada pendaftaran.
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
  UserCheck,
  UserX,
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
  recentSubscribers: [],
  byProduct: { rental: { total: 0, pending: 0 }, booking: { total: 0, pending: 0 } },
});
const error = ref("");
const statCards = [
  {
    key: "totalSubscribers",
    label: "Total pendaftar",
    note: "Rental dan Booking",
    icon: Users,
    tone: "teal",
  },
  {
    key: "confirmed",
    label: "Disetujui",
    note: "sudah disetujui",
    icon: UserCheck,
    tone: "green",
  },
  {
    key: "pending",
    label: "Perlu ditinjau",
    note: "belum diputuskan",
    icon: Clock3,
    tone: "amber",
  },
  {
    key: "rejected",
    label: "Ditolak",
    note: "pendaftaran ditutup",
    icon: UserX,
    tone: "coral",
  },
];
const statusTone = (status) =>
  ({ pending: "warning", confirmed: "success", rejected: "danger" })[status] ||
  "default";
const statusLabel = (status) =>
  ({ pending: "Menunggu", confirmed: "Disetujui", rejected: "Ditolak" })[status] ||
  status;

onMounted(async () => {
  try {
    const { data } = await api.get("/subscribers/stats");
    Object.assign(stats, data.data);
  } catch (requestError) {
    error.value = getApiError(
      requestError,
      "Ringkasan dashboard belum bisa dimuat.",
    );
  }
});
</script>

<style scoped>
.product-overview { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px }
.product-overview-card { position:relative;display:grid;gap:5px;padding:21px;border:1px solid var(--border-color);border-radius:8px;background:var(--surface) }
.product-overview-card span { color:var(--accent-primary);font-size:.7rem;font-weight:800;letter-spacing:.08em }
.product-overview-card strong { font-family:var(--font-display);font-size:1.1rem }
.product-overview-card small { color:var(--text-secondary) }
.product-overview-card svg { position:absolute;right:20px;top:20px;color:var(--accent-primary) }
.attention-actions { display:flex;gap:8px;flex-wrap:wrap }
@media(max-width:620px){.product-overview{grid-template-columns:1fr}}
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
.page-intro .btn { flex: 0 0 auto; white-space: nowrap; }
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
.align-center {
  text-align: center;
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
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-card {
    min-height: auto;
    padding: 15px;
  }
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .page-intro,
  .attention-panel { padding: 18px; }
}
@media (max-width: 820px) {
  .table-wrap { overflow: visible; }
  table { min-width: 0; }
  thead { display: none; }
  tbody { display: grid; gap: 10px; padding: 12px; }
  tr.data-row { display: grid; padding: 7px 13px; border: 1px solid var(--border-color); border-radius: 6px; }
  tr.data-row td {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 9px 0;
    border-top: 0;
    text-align: right;
    overflow-wrap: anywhere;
  }
  tr.data-row td + td { border-top: 1px solid var(--border-color); }
  tr.data-row td::before {
    content: attr(data-label);
    flex: 0 0 40%;
    color: var(--text-muted);
    font-size: 0.7rem;
    font-weight: 800;
    text-align: left;
    text-transform: uppercase;
  }
  tr.data-row td:first-child { display: block; text-align: left; }
  tr.data-row td:first-child::before { display: block; margin-bottom: 5px; }
  tbody > tr:not(.data-row),
  tbody > tr:not(.data-row) > td { display: block; width: 100%; }
  .empty-state { padding: 28px 12px; }
}
@media (max-width: 400px) {
  .metric-grid { grid-template-columns: 1fr; }
}
</style>
