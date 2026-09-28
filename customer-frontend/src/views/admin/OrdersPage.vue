<template>
  <div>
    <AdminPageHeader
      title="Order sewa"
      description="Pantau booking, masa sewa, pengembalian, dan rincian transaksi pelanggan."
    />
    <div class="toolbar">
      <input
        v-model="search"
        class="form-input"
        type="search"
        placeholder="Cari kode atau nama pemesan..."
        @input="debouncedFetch"
      /><select
        v-model="filterStatus"
        class="form-input"
        @change="resetAndFetch"
      >
        <option value="">Semua status</option>
        <option value="booking">Menunggu</option>
        <option value="active">Sedang disewa</option>
        <option value="late">Terlambat</option>
        <option value="completed">Selesai</option>
        <option value="cancelled">Dibatalkan</option>
      </select>
    </div>
    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table has-actions">
          <thead>
            <tr>
              <th data-align="left">Kode order</th>
              <th data-align="left">Nama pemesan</th>
              <th data-align="center">Periode</th>
              <th data-align="right">Total tagihan</th>
              <th data-align="center">Status</th>
              <th data-align="center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td data-align="left">
                <code>{{ order.order_number }}</code>
              </td>
              <td data-align="left">
                <strong>{{ order.customer_name || "-" }}</strong
                ><small class="text-muted cell-subtitle">{{
                  order.customer_whatsapp
                }}</small>
              </td>
              <td data-align="center">
                <span>{{ formatDate(order.start_date) }}</span
                ><small class="text-muted cell-subtitle"
                  >s.d. {{ formatDate(order.end_date) }}</small
                >
              </td>
              <td data-align="right">
                {{ formatCurrency(order.total_amount) }}
              </td>
              <td data-align="center">
                <span
                  class="badge"
                  :class="`badge-${statusColor(order.status)}`"
                  >{{ orderStatusLabel(order.status) }}</span
                >
              </td>
              <td data-align="center">
                <div class="action-buttons">
                  <ActionButton
                    label="Detail"
                    tone="neutral"
                    @click="openDetail(order)"
                    ><template #icon><Eye :size="15" /></template></ActionButton
                  ><ActionButton
                    v-if="order.status === 'booking'"
                    label="Mulai sewa"
                    tone="positive"
                    @click="confirmStatus(order, 'active')"
                    ><template #icon
                      ><PlayCircle :size="15" /></template></ActionButton
                  ><ActionButton
                    v-if="['active', 'late'].includes(order.status)"
                    label="Selesaikan"
                    tone="info"
                    @click="confirmStatus(order, 'completed')"
                    ><template #icon
                      ><CheckCircle :size="15" /></template></ActionButton
                  ><ActionButton
                    v-if="order.status === 'booking'"
                    label="Batalkan"
                    tone="warning"
                    @click="confirmStatus(order, 'cancelled')"
                    ><template #icon><XCircle :size="15" /></template
                  ></ActionButton>
                </div>
              </td>
            </tr>
            <tr v-if="!orders.length">
              <td colspan="6" class="empty-state">
                Tidak ada order yang sesuai.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationControls
        :page="pagination.page"
        :total-pages="pagination.totalPages"
        :total="pagination.total"
        @change="changePage"
      />
    </div>

    <Teleport to="body"
      ><div
        v-if="detailOpen"
        class="modal-overlay"
        @click.self="detailOpen = false"
      >
        <section
          class="detail-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <header>
            <div>
              <p>Detail pesanan</p>
              <h2 id="order-detail-title">
                {{ detail?.order_number || "Memuat..." }}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              @click="detailOpen = false"
            >
              <X :size="20" />
            </button>
          </header>
          <div v-if="detailLoading" class="empty-state">
            Memuat rincian pesanan...
          </div>
          <div v-else-if="detail" class="detail-body">
            <div class="detail-grid">
              <div>
                <span>Pemesan</span><strong>{{ detail.customer_name }}</strong
                ><small
                  >{{ detail.customer_whatsapp
                  }}<template v-if="detail.customer_email">
                    · {{ detail.customer_email }}</template
                  ></small
                >
              </div>
              <div>
                <span>Status</span
                ><strong
                  ><em
                    class="badge"
                    :class="`badge-${statusColor(detail.status)}`"
                    >{{ orderStatusLabel(detail.status) }}</em
                  ></strong
                >
              </div>
              <div>
                <span>Periode sewa</span
                ><strong
                  >{{ formatDate(detail.start_date) }} —
                  {{ formatDate(detail.end_date) }}</strong
                ><small>{{ detail.rental_days }} hari</small>
              </div>
              <div>
                <span>Dibuat</span
                ><strong>{{ formatDate(detail.created_at) }}</strong>
              </div>
            </div>
            <div class="detail-table">
              <h3>Barang yang disewa</h3>
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th data-align="left">Nama barang</th>
                      <th data-align="center">Tarif</th>
                      <th data-align="right">Harga satuan</th>
                      <th data-align="right">Jumlah</th>
                      <th data-align="right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in detail.items" :key="item.id">
                      <td data-align="left">{{ item.item_name }}</td>
                      <td data-align="center">
                        {{ rateLabel(item.rate_type) }}
                      </td>
                      <td data-align="right">
                        {{ formatCurrency(item.rate_amount) }}
                      </td>
                      <td data-align="right">{{ item.quantity }}</td>
                      <td data-align="right">
                        <strong>{{ formatCurrency(item.subtotal) }}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="detail.notes" class="order-note">
              <span>Catatan</span>
              <p>{{ detail.notes }}</p>
            </div>
            <footer>
              <span>Total tagihan</span
              ><strong>{{ formatCurrency(detail.total_amount) }}</strong>
            </footer>
          </div>
        </section>
      </div></Teleport
    >
    <ConfirmModal
      v-model:isOpen="showStatusModal"
      :title="statusModalTitle"
      :message="statusModalMessage"
      :type="targetStatus === 'cancelled' ? 'danger' : 'info'"
      :confirmText="statusModalConfirmText"
      :confirmBtnClass="
        targetStatus === 'cancelled' ? 'btn-danger' : 'btn-primary'
      "
      :isLoading="isSubmitting"
      @confirm="executeStatusChange"
    />
    <ToastMessage
      :message="toast.message"
      :type="toast.type"
      @close="toast.message = ''"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { CheckCircle, Eye, PlayCircle, X, XCircle } from "lucide-vue-next";
import api from "../../services/api";
import ActionButton from "../../components/admin/ActionButton.vue";
import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import ConfirmModal from "../../components/admin/ConfirmModal.vue";
import PaginationControls from "../../components/admin/PaginationControls.vue";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import {
  formatCurrency,
  formatDate,
  getApiError,
  orderStatusLabel,
} from "../../utils/formatters";

const orders = ref([]);
const pagination = reactive({ page: 1, totalPages: 1, total: 0 });
const search = ref("");
const filterStatus = ref("");
const showStatusModal = ref(false);
const selectedOrder = ref(null);
const targetStatus = ref("");
const isSubmitting = ref(false);
const detailOpen = ref(false);
const detailLoading = ref(false);
const detail = ref(null);
const toast = reactive({ message: "", type: "success" });
let searchTimer;
const statusColor = (status) =>
  ({
    booking: "info",
    active: "success",
    late: "danger",
    completed: "default",
    cancelled: "warning",
  })[status] || "default";
async function fetchData() {
  try {
    const { data } = await api.get("/orders", {
      params: {
        search: search.value,
        status: filterStatus.value || undefined,
        page: pagination.page,
      },
    });
    const lastPage = Math.max(data.pagination.totalPages, 1);
    if (pagination.page > lastPage) {
      pagination.page = lastPage;
      return fetchData();
    }
    orders.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (error) {
    showError(error, "Data order belum dapat dimuat.");
  }
}
function showError(error, fallback) {
  toast.message = getApiError(error, fallback);
  toast.type = "error";
}
function resetAndFetch() {
  pagination.page = 1;
  fetchData();
}
function changePage(page) {
  pagination.page = Math.min(Math.max(page, 1), pagination.totalPages);
  fetchData();
}
function debouncedFetch() {
  clearTimeout(searchTimer);
  pagination.page = 1;
  searchTimer = setTimeout(fetchData, 300);
}
async function openDetail(order) {
  detailOpen.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    const { data } = await api.get(`/orders/${order.id}`);
    const start = new Date(`${data.start_date}T00:00:00`);
    const end = new Date(`${data.end_date}T00:00:00`);
    data.rental_days = Math.floor((end - start) / 86_400_000) + 1;
    detail.value = data;
  } catch (error) {
    detailOpen.value = false;
    showError(error, "Detail order belum dapat dimuat.");
  } finally {
    detailLoading.value = false;
  }
}
function confirmStatus(order, status) {
  selectedOrder.value = order;
  targetStatus.value = status;
  showStatusModal.value = true;
}
const statusModalTitle = computed(() =>
  targetStatus.value === "active"
    ? "Mulai masa sewa"
    : targetStatus.value === "completed"
      ? "Selesaikan pesanan"
      : "Batalkan pesanan",
);
const statusModalMessage = computed(() =>
  targetStatus.value === "active"
    ? `Tandai ${selectedOrder.value?.order_number} sebagai sedang disewa?`
    : targetStatus.value === "completed"
      ? `Pastikan barang pada ${selectedOrder.value?.order_number} sudah kembali.`
      : `Batalkan pesanan ${selectedOrder.value?.order_number}?`,
);
const statusModalConfirmText = computed(() =>
  targetStatus.value === "active"
    ? "Mulai sewa"
    : targetStatus.value === "completed"
      ? "Selesaikan"
      : "Batalkan",
);
async function executeStatusChange() {
  isSubmitting.value = true;
  try {
    await api.patch(`/orders/${selectedOrder.value.id}/status`, {
      status: targetStatus.value,
    });
    showStatusModal.value = false;
    toast.message = "Status order berhasil diperbarui.";
    toast.type = "success";
    await fetchData();
  } catch (error) {
    showError(error, "Status order belum dapat diperbarui.");
  } finally {
    isSubmitting.value = false;
  }
}
const rateLabel = (value) =>
  ({ daily: "Harian", weekly: "Mingguan", monthly: "Bulanan" })[value] || value;
onMounted(fetchData);
onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<style scoped>
.toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 360px) 190px;
  gap: 10px;
  margin-bottom: 18px;
}
.table-card {
  overflow: hidden;
}
.cell-subtitle {
  display: block;
  margin-top: 3px;
}
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.data-table code {
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--surface-subtle);
  color: var(--text-primary);
}
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgba(10, 22, 16, 0.68);
  backdrop-filter: blur(4px);
}
.detail-modal {
  width: min(900px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--surface-raised);
  box-shadow: var(--shadow-lg);
}
.detail-modal > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px;
  border-bottom: 1px solid var(--border-color);
}
.detail-modal header p {
  color: var(--brand-primary);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}
.detail-modal header h2 {
  margin-top: 4px;
  font-size: 1.35rem;
}
.detail-modal header button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-primary);
}
.detail-body {
  padding: 26px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--border-color);
}
.detail-grid > div {
  padding: 15px;
  background: var(--surface);
}
.detail-grid span,
.order-note > span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.detail-grid strong,
.detail-grid small {
  display: block;
}
.detail-grid small {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 0.75rem;
}
.detail-grid em {
  font-style: normal;
}
.detail-table {
  margin-top: 25px;
}
.detail-table h3 {
  margin-bottom: 12px;
  font-size: 1rem;
}
.order-note {
  margin-top: 20px;
  padding: 14px;
  border-left: 3px solid var(--brand-moss);
  background: var(--surface-subtle);
}
.order-note p {
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.detail-body > footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border-color);
}
.detail-body > footer span {
  color: var(--text-secondary);
}
.detail-body > footer strong {
  font-size: 1.35rem;
}
.empty-state {
  padding: 54px;
  text-align: center;
}
@media (max-width: 620px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-body {
    padding: 18px;
  }
}
</style>
