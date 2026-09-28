<template>
  <div class="subscriber-page">
    <section class="page-intro">
      <div>
        <p class="page-kicker">Manajemen subscriber</p>
        <h2>Review pendaftaran bisnis</h2>
        <p>
          Konfirmasi akses, tolak pendaftaran yang belum sesuai, atau rapikan
          data yang sudah selesai.
        </p>
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
          <option value="pending">Menunggu review</option>
          <option value="confirmed">Aktif</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>
      <div v-if="loading" class="loading-state">
        <LoaderCircle :size="20" /> Memuat subscriber...
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bisnis</th>
              <th>Pemilik</th>
              <th>Kontak</th>
              <th>Metode</th>
              <th>Status</th>
              <th><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subscriber in subscribers" :key="subscriber.id">
              <td>
                <strong>{{ subscriber.business_name || "Belum diisi" }}</strong
                ><small>{{
                  subscriber.business_type || "Jenis bisnis belum diisi"
                }}</small>
              </td>
              <td>
                <strong>{{ subscriber.name }}</strong
                ><small>{{ subscriber.email }}</small>
              </td>
              <td>{{ subscriber.whatsapp }}</td>
              <td>
                <strong>{{ formatCurrency(subscriber.amount) }}</strong
                ><small
                  >{{ subscriber.payment_method }} ·
                  {{ subscriber.plan }}</small
                >
              </td>
              <td>
                <span
                  class="badge"
                  :class="`badge-${statusTone(subscriber.status)}`"
                  >{{ statusLabel(subscriber.status) }}</span
                >
              </td>
              <td class="actions">
                <button
                  v-if="subscriber.status === 'pending'"
                  class="action-button approve"
                  type="button"
                  title="Konfirmasi subscriber"
                  @click="openStatusModal(subscriber, 'confirmed')"
                >
                  <Check :size="17" /></button
                ><button
                  v-if="subscriber.status === 'pending'"
                  class="action-button reject"
                  type="button"
                  title="Tolak subscriber"
                  @click="openStatusModal(subscriber, 'rejected')"
                >
                  <X :size="17" /></button
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
                  title="Hapus subscriber"
                  @click="openDeleteModal(subscriber)"
                >
                  <Trash2 :size="16" />
                </button>
              </td>
            </tr>
            <tr v-if="!subscribers.length">
              <td colspan="6">
                <div class="empty-state">
                  <Inbox :size="27" /><strong>Belum ada subscriber</strong
                  ><span
                    >Data pendaftaran bisnis akan tampil di sini setelah ada
                    order masuk.</span
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
            {{ pagination.total }} subscriber</span
          ><span v-else>Belum ada subscriber</span>
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
          ><template v-for="item in pageItems" :key="item"
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
const loading = ref(false);
const search = ref("");
const filterStatus = ref(route.query.status || "");
const pagination = reactive({ page: 1, total: 0, totalPages: 1 });
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
const statusTone = (status) =>
  ({ pending: "warning", confirmed: "success", rejected: "danger" })[status] ||
  "default";
const statusLabel = (status) =>
  ({ pending: "Menunggu", confirmed: "Aktif", rejected: "Ditolak" })[status] ||
  status;
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
  loading.value = true;
  try {
    const params = { page: pagination.page, limit: 10 };
    if (search.value) params.search = search.value;
    if (filterStatus.value) params.status = filterStatus.value;
    const { data } = await api.get("/subscribers", { params });
    subscribers.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (error) {
    showToast(
      getApiError(error, "Data subscriber belum bisa dimuat."),
      "error",
    );
  } finally {
    loading.value = false;
  }
}
function showToast(message, type = "success") {
  toast.message = message;
  toast.type = type;
}
function openStatusModal(subscriber, status) {
  const labels = {
    confirmed: "Konfirmasi",
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
      ? "Akses bisnis ini akan ditandai sebagai aktif."
      : "Status pendaftaran akan diperbarui.";
  modal.confirmText = labels[status];
  modal.confirmClass = status === "rejected" ? "btn-danger" : "btn-primary";
}
function openDeleteModal(subscriber) {
  modal.open = true;
  modal.type = "delete";
  modal.subscriber = subscriber;
  modal.title = `Hapus ${subscriber.business_name || subscriber.name}?`;
  modal.message = "Data subscriber akan dihapus permanen dari platform.";
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
        ? "Subscriber berhasil dihapus."
        : "Status subscriber berhasil diperbarui.",
    );
    await fetchSubscribers();
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
onBeforeUnmount(() => clearTimeout(searchTimer));
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.action-button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--surface);
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
</style>
