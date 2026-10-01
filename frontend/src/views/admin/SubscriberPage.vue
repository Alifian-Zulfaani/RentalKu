<template>
  <div class="subscriber-page">
    <section class="page-intro">
      <div>
        <p class="page-kicker">RentalKu {{ productLabel }}</p>
        <h2>Pendaftar {{ productLabel }}</h2>
        <p>Tinjau bisnis yang mendaftar dan perbarui status pendaftarannya.</p>
      </div>
      <span class="total-count">{{ pagination.total }} total</span>
    </section>
    <section class="list-panel">
      <div class="filters">
        <label class="search-box"
          ><Search :size="18" /><input
            v-model="search"
            type="search"
            placeholder="Cari bisnis, nama, atau email" /></label
        ><select v-model="filterStatus" class="status-select">
          <option value="">Semua status</option>
          <option value="pending">Perlu ditinjau</option>
          <option value="confirmed">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>
      <div v-if="loading" class="loading-state">
        <LoaderCircle :size="20" /> Memuat pendaftar...
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bisnis</th>
              <th>Pemilik</th>
              <th>Kontak</th>
              <th class="align-right">Biaya</th>
              <th class="align-center">Status</th>
              <th class="align-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subscriber in subscribers" :key="subscriber.id" class="data-row">
              <td data-label="Bisnis">
                <strong>{{ subscriber.business_name || "Belum diisi" }}</strong
                ><small>{{
                  subscriber.business_type || "Jenis bisnis belum diisi"
                }}</small>
              </td>
              <td data-label="Pemilik">
                <strong>{{ subscriber.name }}</strong
                ><small>{{ subscriber.email }}</small>
              </td>
              <td data-label="Kontak">{{ subscriber.whatsapp }}</td>
              <td class="align-right" data-label="Biaya">
                <strong>{{ formatCurrency(subscriber.amount) }}</strong
                ><small>Early access</small>
              </td>
              <td class="align-center" data-label="Status">
                <span
                  class="badge"
                  :class="`badge-${statusTone(subscriber.status)}`"
                  >{{ statusLabel(subscriber.status) }}</span
                >
              </td>
              <td class="actions" data-label="Aksi">
                <button
                  v-if="subscriber.status === 'pending'"
                  class="action-button approve"
                  type="button"
                  title="Setujui pendaftaran"
                  @click="openStatusModal(subscriber, 'confirmed')"
                >
                  <Check :size="17" /> Setujui</button
                ><button
                  v-if="subscriber.status === 'pending'"
                  class="action-button reject"
                  type="button"
                  title="Tolak pendaftaran"
                  @click="openStatusModal(subscriber, 'rejected')"
                >
                  <X :size="17" /> Tolak</button
                ><button
                  v-if="subscriber.status === 'rejected'"
                  class="action-text"
                  type="button"
                  @click="openStatusModal(subscriber, 'pending')"
                >
                  Tinjau ulang</button
                ><button
                  v-if="subscriber.status !== 'pending'"
                  class="action-button delete"
                  type="button"
                  title="Hapus pendaftar"
                  @click="openDeleteModal(subscriber)"
                >
                  <Trash2 :size="16" /> Hapus
                </button>
              </td>
            </tr>
            <tr v-if="!subscribers.length">
              <td colspan="6">
                <div class="empty-state">
                  <Inbox :size="27" /><strong>Belum ada pendaftar</strong
                  ><span
                    >Pendaftaran bisnis akan tampil di sini setelah formulir
                    dikirim.</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="pagination">
        <div class="pagination-info">
          <button
            class="reload-button"
            type="button"
            :disabled="loading"
            @click="refreshData"
          >
            <RefreshCw :size="15" :class="{ spinning: loading }" />{{
              loading ? "Memuat..." : "Muat ulang data"
            }}</button
          ><span v-if="pagination.total"
            >Menampilkan {{ rangeStart }}-{{ rangeEnd }} dari
            {{ pagination.total }} pendaftar</span
          ><span v-else>Belum ada pendaftar</span>
        </div>
        <div v-if="pagination.total > 0" class="page-controls">
          <button
            class="pagination-button"
            type="button"
            aria-label="Halaman sebelumnya"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
          >
            <ChevronLeft :size="17" /></button
          ><template
            v-for="(item, index) in pageItems"
            :key="`${item}-${index}`"
            ><span v-if="item === 'ellipsis'" class="page-ellipsis">...</span
            ><button
              v-else
              class="pagination-button page-number"
              :class="{ active: item === pagination.page }"
              type="button"
              :aria-label="`Halaman ${item}`"
              :aria-current="item === pagination.page ? 'page' : undefined"
              @click="changePage(item)"
            >
              {{ item }}
            </button></template
          ><button
            class="pagination-button"
            type="button"
            aria-label="Halaman berikutnya"
            :disabled="pagination.page === pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            <ChevronRight :size="17" />
          </button>
        </div>
      </footer>
    </section>
    <ConfirmModal
      :isOpen="modal.open"
      :title="modal.title"
      :message="modal.message"
      :confirmText="modal.confirmText"
      :confirmClass="modal.confirmClass"
      @cancel="modal.open = false"
      @confirm="performAction"
    />
    <ToastMessage
      :message="toast.message"
      :type="toast.type"
      @close="toast.message = ''"
    />
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-vue-next";
import api from "../../services/api";
import ConfirmModal from "../../components/admin/ConfirmModal.vue";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import { formatCurrency, getApiError } from "../../utils/formatters";

const subscribers = ref([]);
const route = useRoute();
const productType = computed(() =>
  route.path.endsWith("/booking") ? "booking" : "rental",
);
const productLabel = computed(() =>
  productType.value === "booking" ? "Booking" : "Rental",
);
const loading = ref(false);
const search = ref("");
const filterStatus = ref(route.query.status || "");
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 1 });
const toast = reactive({ message: "", type: "success" });
const modal = reactive({
  open: false,
  type: "",
  subscriber: null,
  targetStatus: "",
  title: "",
  message: "",
  confirmText: "",
  confirmClass: "btn-primary",
});
let searchTimer;
let requestId = 0;
const statusTone = (status) =>
  ({ pending: "warning", confirmed: "success", rejected: "danger" })[status] ||
  "default";
const statusLabel = (status) =>
  ({ pending: "Menunggu", confirmed: "Disetujui", rejected: "Ditolak" })[
    status
  ] || status;
const rangeStart = computed(() =>
  pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0,
);
const rangeEnd = computed(() =>
  Math.min(pagination.page * pagination.limit, pagination.total),
);
const pageItems = computed(() => {
  const { page, totalPages } = pagination;
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, "ellipsis", totalPages];
  if (page >= totalPages - 2)
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", page, "ellipsis", totalPages];
});

async function fetchSubscribers() {
  const currentRequest = ++requestId;
  loading.value = true;
  try {
    const params = { page: pagination.page, limit: 10 };
    if (search.value) params.search = search.value;
    if (filterStatus.value) params.status = filterStatus.value;
    params.product_type = productType.value;
    const { data } = await api.get("/subscribers", { params });
    if (currentRequest !== requestId) return;
    subscribers.value = data.data;
    Object.assign(pagination, data.meta.pagination);
  } catch (error) {
    if (currentRequest !== requestId) return;
    showToast(getApiError(error, "Data pendaftar belum bisa dimuat."), "error");
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}
function showToast(message, type = "success") {
  toast.message = message;
  toast.type = type;
}
function openStatusModal(subscriber, status) {
  const labels = {
    confirmed: "Setujui",
    rejected: "Tolak",
    pending: "Tinjau ulang",
  };
  modal.open = true;
  modal.type = "status";
  modal.subscriber = subscriber;
  modal.targetStatus = status;
  modal.title = `${labels[status]} ${subscriber.business_name || subscriber.name}?`;
  modal.message =
    status === "confirmed"
      ? "Pendaftaran ini akan ditandai disetujui. Aktivasi aplikasi dilakukan terpisah."
      : status === "rejected"
        ? "Pendaftaran ini akan ditolak."
        : "Pendaftaran ini akan kembali ke daftar yang perlu ditinjau.";
  modal.confirmText = labels[status];
  modal.confirmClass = status === "rejected" ? "btn-danger" : "btn-primary";
}
function openDeleteModal(subscriber) {
  modal.open = true;
  modal.type = "delete";
  modal.subscriber = subscriber;
  modal.title = `Hapus ${subscriber.business_name || subscriber.name}?`;
  modal.message = "Data pendaftaran ini akan dihapus permanen dari platform.";
  modal.confirmText = "Hapus";
  modal.confirmClass = "btn-danger";
}
async function performAction() {
  const { type, subscriber, targetStatus } = modal;
  modal.open = false;
  try {
    if (type === "status")
      await api.patch(`/subscribers/${subscriber.id}/status`, {
        status: targetStatus,
      });
    else await api.delete(`/subscribers/${subscriber.id}`);
    showToast(
      type === "delete"
        ? "Data pendaftar dihapus."
        : "Status pendaftaran diperbarui.",
    );
    await fetchSubscribers();
    if (pagination.page > pagination.totalPages) {
      pagination.page = pagination.totalPages;
      await fetchSubscribers();
    }
  } catch (error) {
    showToast(getApiError(error), "error");
  }
}
function changePage(page) {
  if (page === pagination.page || page < 1 || page > pagination.totalPages)
    return;
  pagination.page = page;
  fetchSubscribers();
}
function refreshData() {
  fetchSubscribers();
}
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.page = 1;
    fetchSubscribers();
  }, 350);
});
watch(filterStatus, () => {
  pagination.page = 1;
  fetchSubscribers();
});
onMounted(fetchSubscribers);
watch(productType, () => {
  clearTimeout(searchTimer);
  pagination.page = 1;
  fetchSubscribers();
});
onBeforeUnmount(() => {
  clearTimeout(searchTimer);
  requestId += 1;
});
</script>

<style scoped>
.subscriber-page {
  display: grid;
  gap: 20px;
}
.page-intro,
.list-panel {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--surface);
}
.page-intro {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  padding: 25px;
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
  font-size: 1.45rem;
}
.page-intro p:not(.page-kicker) {
  max-width: 660px;
  margin-top: 7px;
  color: var(--text-secondary);
}
.total-count {
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}
.filters {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}
.search-box {
  display: flex;
  min-height: 39px;
  flex: 1;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  color: var(--text-muted);
}
.search-box:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.86rem;
}
.status-select {
  min-width: 165px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.84rem;
}
.loading-state {
  display: flex;
  min-height: 190px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--text-muted);
  font-size: 0.86rem;
}
.loading-state svg,
.spinning {
  animation: spin 0.8s linear infinite;
}
.empty-state {
  display: grid;
  min-height: 220px;
  place-content: center;
  justify-items: center;
  gap: 7px;
  color: var(--text-muted);
  text-align: center;
}
.empty-state svg {
  color: var(--accent-primary);
}
.empty-state strong {
  color: var(--text-primary);
  font-size: 0.9rem;
}
.empty-state span {
  max-width: 310px;
  font-size: 0.78rem;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
}
th {
  padding: 11px 16px;
  background: var(--surface-subtle);
  color: var(--text-muted);
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
}
.align-right {
  text-align: right;
}
.align-center {
  text-align: center;
}
td {
  padding: 13px 16px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.79rem;
}
td strong,
td small {
  display: block;
}
td strong {
  color: var(--text-primary);
  font-size: 0.81rem;
}
td small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 0.71rem;
}
.actions {
  text-align: center;
  white-space: nowrap;
}
.actions > button + button {
  margin-left: 6px;
}
.action-button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 9px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--surface);
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}
.action-button.approve {
  color: var(--success);
}
.action-button.reject,
.action-button.delete {
  color: var(--danger);
}
.action-button:hover {
  background: var(--surface-subtle);
}
.action-text {
  background: transparent;
  color: var(--accent-primary);
  font-size: 0.75rem;
  font-weight: 800;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.77rem;
}
.pagination-info,
.page-controls {
  display: flex;
  align-items: center;
  gap: 9px;
}
.reload-button {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.74rem;
  font-weight: 800;
}
.reload-button:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
.reload-button:disabled {
  opacity: 0.55;
}
.pagination-button {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--surface);
  color: var(--text-primary);
}
.pagination-button:hover:not(:disabled),
.pagination-button.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: var(--accent-contrast);
}
.pagination-button:disabled {
  opacity: 0.35;
}
.page-ellipsis {
  width: 20px;
  color: var(--text-muted);
  text-align: center;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 620px) {
  .page-intro {
    align-items: start;
    flex-direction: column;
  }
  .filters {
    flex-direction: column;
  }
  .status-select {
    min-height: 39px;
  }
  .pagination {
    align-items: stretch;
    flex-direction: column;
  }
  .pagination-info,
  .page-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
}
@media (max-width: 960px) {
  .pagination { flex-wrap: wrap; }
  .pagination-info { flex-wrap: wrap; }
}
@media (max-width: 960px) {
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
    flex: 0 0 32%;
    color: var(--text-muted);
    font-size: 0.7rem;
    font-weight: 800;
    text-align: left;
    text-transform: uppercase;
  }
  tr.data-row td:first-child,
  tr.data-row td:nth-child(2) { display: block; text-align: left; }
  tr.data-row td:first-child::before,
  tr.data-row td:nth-child(2)::before { display: block; margin-bottom: 5px; }
  tr.data-row td.actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-start; text-align: left; white-space: normal; }
  tr.data-row td.actions::before { flex-basis: 100%; }
  .actions > button + button { margin-left: 0; }
  tbody > tr:not(.data-row),
  tbody > tr:not(.data-row) > td { display: block; width: 100%; }
  .empty-state { min-height: 180px; padding: 18px; }
  .pagination { justify-content: center; }
}
</style>
