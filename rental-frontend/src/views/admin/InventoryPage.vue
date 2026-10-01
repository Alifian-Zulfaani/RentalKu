<template>
  <div>
    <AdminPageHeader title="Inventaris" description="Kelola stok, tarif, kategori, dan kesiapan seluruh perlengkapan rental.">
      <template #actions><button class="btn btn-primary" @click="openFormModal()"><Plus :size="18" /> Tambah barang</button></template>
    </AdminPageHeader>
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          type="text"
          class="form-input"
          placeholder="Cari barang..."
          v-model="search"
          @input="debouncedFetch"
        />
        <select class="form-input" v-model="filterStatus" @change="resetAndFetch">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="maintenance">Perawatan</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
    </div>
    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table has-actions">
          <thead>
            <tr>
              <th data-align="left">Nama barang</th>
              <th data-align="center">Kategori</th>
              <th data-align="right">Stok (tersedia)</th>
              <th data-align="right">Tarif per hari</th>
              <th data-align="center">Status</th>
              <th data-align="center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in items" :key="i.id">
              <td data-align="left">
                <strong>{{ i.name }}</strong>
              </td>
              <td data-align="center"><span class="badge badge-default">{{ i.category_name || "Tanpa kategori" }}</span></td>
              <td data-align="right">{{ i.stock }} ({{ i.available_stock }})</td>
              <td data-align="right">{{ formatRp(i.rate_daily) }}</td>
              <td data-align="center">
                <span
                  class="badge"
                  :class="
                    'badge-' +
                    (i.status === 'active'
                      ? 'success'
                      : i.status === 'maintenance'
                        ? 'warning'
                        : 'danger')
                  "
                  >{{ inventoryStatusLabel(i.status) }}</span
                >
              </td>
              <td data-align="center">
                <div class="action-buttons">
                  <ActionButton label="Edit" tone="info" @click="openFormModal(i)">
                    <template #icon><Edit :size="15" /></template>
                  </ActionButton>
                  <ActionButton label="Hapus" tone="danger" @click="confirmDelete(i)">
                    <template #icon><Trash2 :size="15" /></template>
                  </ActionButton>
                </div>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="6" class="text-center text-muted">Tidak ada data</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationControls :page="pagination.page" :total-pages="pagination.totalPages" :total="pagination.total" @change="changePage" />
    </div>

    <!-- Form Modal (Create/Edit) -->
    <Teleport to="body">
      <div
        v-if="showFormModal"
        class="modal-overlay"
        @click.self="showFormModal = false"
      >
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h3>{{ isEdit ? "Edit Barang" : "Tambah Barang Baru" }}</h3>
          </div>
          <form @submit.prevent="saveItem">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nama Barang</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="formData.name"
                  required
                />
              </div>
              <div class="form-group row-group">
                <div class="col">
                  <label class="form-label">Kategori</label>
                  <select class="form-input" v-model="formData.category_id">
                    <option value="">Pilih Kategori</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>
                <div class="col">
                  <label class="form-label">Total Stok</label>
                  <input
                    type="number"
                    class="form-input"
                    v-model="formData.stock"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div class="form-group row-group">
                <div class="col">
                  <label class="form-label">Tarif Harian (Rp)</label>
                  <input type="number" class="form-input" v-model.number="formData.rate_daily" min="0" required />
                </div>
                <div class="col">
                  <label class="form-label">Tarif Mingguan (Rp)</label>
                  <input type="number" class="form-input" v-model.number="formData.rate_weekly" min="0" required />
                </div>
              </div>
              <div class="form-group row-group">
                <div class="col">
                  <label class="form-label">Tarif Bulanan (Rp)</label>
                  <input type="number" class="form-input" v-model.number="formData.rate_monthly" min="0" required />
                </div>
                <div class="col">
                  <label class="form-label">Status</label>
                  <select class="form-input" v-model="formData.status" required>
                    <option value="active">Aktif</option>
                    <option value="maintenance">Perawatan</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">URL Gambar <span class="text-muted">(opsional)</span></label>
                <input type="url" class="form-input" v-model.trim="formData.image_url" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label class="form-label">Deskripsi</label>
                <textarea class="form-input" v-model.trim="formData.description" rows="3" maxlength="2000"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showFormModal = false"
              >
                Batal
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? "Menyimpan..." : "Simpan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model:isOpen="showDeleteModal"
      title="Hapus Barang"
      :message="`Apakah Anda yakin ingin menghapus '${selectedItem?.name}'? Data yang dihapus tidak dapat dikembalikan.`"
      type="danger"
      confirmText="Ya, Hapus"
      confirmBtnClass="btn-danger"
      :isLoading="isSubmitting"
      @confirm="executeDelete"
    />
    <ToastMessage :message="toast.message" :type="toast.type" @close="toast.message = ''" />
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, onMounted } from "vue";
import api from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-vue-next";
import ConfirmModal from "../../components/admin/ConfirmModal.vue";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import ActionButton from "../../components/admin/ActionButton.vue";
import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import PaginationControls from "../../components/admin/PaginationControls.vue";
import { formatCurrency, getApiError, inventoryStatusLabel } from "../../utils/formatters";

const items = ref([]);
const categories = ref([]);
const pagination = reactive({ page: 1, totalPages: 1, total: 0 });
const search = ref("");
const filterStatus = ref("");

// Form State
const showFormModal = ref(false);
const isEdit = ref(false);
const isSubmitting = ref(false);
const formData = reactive({
  id: null,
  name: "",
  category_id: "",
  stock: 0,
  rate_daily: 0,
  rate_weekly: 0,
  rate_monthly: 0,
  status: "active",
  image_url: "",
  description: "",
});

// Delete State
const showDeleteModal = ref(false);
const selectedItem = ref(null);
const toast = reactive({ message: "", type: "success" });
let searchTimer;

const formatRp = formatCurrency;

async function fetchData() {
  try {
    const { data } = await api.get("/inventory", {
      params: {
        search: search.value,
        status: filterStatus.value,
        page: pagination.page,
      },
    });
    const lastPage = Math.max(data.pagination.totalPages, 1);
    if (pagination.page > lastPage) { pagination.page = lastPage; return fetchData(); }
    items.value = data.data;
    Object.assign(pagination, data.pagination);

    if (!categories.value.length) {
      const catRes = await api.get("/inventory/categories");
      categories.value = catRes.data;
    }
  } catch (e) {
    toast.message = getApiError(e, "Data inventaris belum dapat dimuat.");
    toast.type = "error";
  }
}
function changePage(p) {
  pagination.page = Math.min(Math.max(p, 1), pagination.totalPages);
  fetchData();
}
function resetAndFetch() { pagination.page = 1; fetchData(); }
function debouncedFetch() {
  clearTimeout(searchTimer);
  pagination.page = 1;
  searchTimer = setTimeout(fetchData, 300);
}

// CRUD Actions
function openFormModal(item = null) {
  isEdit.value = !!item;
  if (item) {
    Object.assign(formData, {
      id: item.id,
      name: item.name,
      category_id: item.category_id || "",
      stock: item.stock,
      rate_daily: item.rate_daily,
      rate_weekly: item.rate_weekly,
      rate_monthly: item.rate_monthly,
      status: item.status,
      image_url: item.image_url || "",
      description: item.description || "",
    });
  } else {
    Object.assign(formData, {
      id: null,
      name: "",
      category_id: "",
      stock: 0,
      rate_daily: 0,
      rate_weekly: 0,
      rate_monthly: 0,
      status: "active",
      image_url: "",
      description: "",
    });
  }
  showFormModal.value = true;
}

async function saveItem() {
  isSubmitting.value = true;
  try {
    if (isEdit.value) await api.put(`/inventory/${formData.id}`, formData);
    else await api.post("/inventory", formData);
    showFormModal.value = false;
    toast.message = isEdit.value ? "Barang berhasil diperbarui." : "Barang berhasil ditambahkan.";
    toast.type = "success";
    await fetchData();
  } catch (e) {
    toast.message = getApiError(e, "Barang belum dapat disimpan.");
    toast.type = "error";
  } finally {
    isSubmitting.value = false;
  }
}

function confirmDelete(item) {
  selectedItem.value = item;
  showDeleteModal.value = true;
}

async function executeDelete() {
  isSubmitting.value = true;
  try {
    await api.delete(`/inventory/${selectedItem.value.id}`);
    showDeleteModal.value = false;
    toast.message = "Barang berhasil dihapus.";
    toast.type = "success";
    await fetchData();
  } catch (e) {
    toast.message = getApiError(e, "Barang belum dapat dihapus.");
    toast.type = "error";
  } finally {
    isSubmitting.value = false;
  }
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
  vertical-align: middle;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 40px);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-content form { overflow-y: auto; }
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}
.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}
.modal-body {
  padding: 24px;
}
.row-group {
  display: flex;
  gap: 16px;
}
.row-group .col {
  flex: 1;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(0, 0, 0, 0.1);
}
</style>
