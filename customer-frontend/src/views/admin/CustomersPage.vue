<template>
  <div>
    <AdminPageHeader
      title="Pelanggan"
      description="Lihat riwayat singkat pemesan dan kelola akses booking pelanggan."
    />
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          type="text"
          class="form-input"
          placeholder="Cari pelanggan..."
          v-model="search"
          @input="debouncedFetch"
        />
        <select
          class="form-input"
          v-model="filterStatus"
          @change="resetAndFetch"
        >
          <option value="">Semua Status</option>
          <option value="0">Aktif</option>
          <option value="1">Diblokir</option>
        </select>
      </div>
    </div>
    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table has-actions">
          <thead>
            <tr>
              <th data-align="left">Nama pemesan</th>
              <th data-align="left">Kontak</th>
              <th data-align="right">Total order</th>
              <th data-align="center">Status</th>
              <th data-align="center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td data-align="left">
                <strong>{{ c.name }}</strong>
              </td>
              <td data-align="left">
                <div>{{ c.whatsapp }}</div>
                <small class="text-muted">{{ c.email || "-" }}</small>
              </td>
              <td data-align="right">{{ c.total_orders }} order</td>
              <td data-align="center">
                <span
                  class="badge"
                  :class="c.is_blacklisted ? 'badge-danger' : 'badge-success'"
                  >{{ c.is_blacklisted ? "Diblokir" : "Aktif" }}</span
                >
              </td>
              <td data-align="center">
                <ActionButton
                  :label="c.is_blacklisted ? 'Pulihkan' : 'Blokir'"
                  :tone="c.is_blacklisted ? 'positive' : 'warning'"
                  @click="confirmToggle(c)"
                >
                  <template #icon>
                    <ShieldCheck v-if="c.is_blacklisted" :size="15" />
                    <ShieldAlert v-else :size="15" />
                  </template>
                </ActionButton>
              </td>
            </tr>
            <tr v-if="!customers.length">
              <td colspan="5" class="text-center text-muted">
                Tidak ada data pelanggan
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
    <ConfirmModal
      v-model:isOpen="showConfirm"
      :title="
        selectedCustomer?.is_blacklisted
          ? 'Pulihkan pelanggan'
          : 'Blokir pelanggan'
      "
      :message="confirmMessage"
      :type="selectedCustomer?.is_blacklisted ? 'info' : 'warning'"
      :confirmText="
        selectedCustomer?.is_blacklisted ? 'Ya, pulihkan' : 'Ya, blokir'
      "
      :isLoading="submitting"
      @confirm="executeToggle"
    />
    <ToastMessage
      :message="toast.message"
      :type="toast.type"
      @close="toast.message = ''"
    />
  </div>
</template>

<script setup>
import { computed, ref, reactive, onBeforeUnmount, onMounted } from "vue";
import { ShieldAlert, ShieldCheck } from "lucide-vue-next";
import api from "../../services/api";
import ConfirmModal from "../../components/admin/ConfirmModal.vue";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import ActionButton from "../../components/admin/ActionButton.vue";
import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import PaginationControls from "../../components/admin/PaginationControls.vue";
import { getApiError } from "../../utils/formatters";

const customers = ref([]);
const pagination = reactive({ page: 1, totalPages: 1, total: 0 });
const search = ref("");
const filterStatus = ref("");
const showConfirm = ref(false);
const selectedCustomer = ref(null);
const submitting = ref(false);
const toast = reactive({ message: "", type: "success" });
let searchTimer;
const confirmMessage = computed(() =>
  selectedCustomer.value?.is_blacklisted
    ? `Izinkan ${selectedCustomer.value?.name} membuat booking kembali?`
    : `Cegah ${selectedCustomer.value?.name} membuat booking baru?`,
);

async function fetchData() {
  try {
    const { data } = await api.get("/customers", {
      params: {
        search: search.value,
        is_blacklisted: filterStatus.value || undefined,
        page: pagination.page,
      },
    });
    const lastPage = Math.max(data.pagination.totalPages, 1);
    if (pagination.page > lastPage) {
      pagination.page = lastPage;
      return fetchData();
    }
    customers.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (e) {
    toast.message = getApiError(e, "Data pelanggan belum dapat dimuat.");
    toast.type = "error";
  }
}
function resetAndFetch() {
  pagination.page = 1;
  fetchData();
}
function debouncedFetch() {
  clearTimeout(searchTimer);
  pagination.page = 1;
  searchTimer = setTimeout(fetchData, 300);
}
function confirmToggle(customer) {
  selectedCustomer.value = customer;
  showConfirm.value = true;
}
async function executeToggle() {
  submitting.value = true;
  try {
    await api.patch(`/customers/${selectedCustomer.value.id}/blacklist`);
    showConfirm.value = false;
    toast.message = selectedCustomer.value.is_blacklisted
      ? "Pelanggan berhasil dipulihkan."
      : "Pelanggan berhasil diblokir.";
    toast.type = "success";
    await fetchData();
  } catch (error) {
    toast.message = getApiError(
      error,
      "Status pelanggan belum dapat diperbarui.",
    );
    toast.type = "error";
  } finally {
    submitting.value = false;
  }
}
function changePage(p) {
  pagination.page = Math.min(Math.max(p, 1), pagination.totalPages);
  fetchData();
}
onMounted(fetchData);
onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.toolbar-left {
  display: flex;
  gap: 12px;
}
.table-card {
  padding: 0;
  overflow: hidden;
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
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}
.data-table td {
  padding: 14px 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}
</style>
