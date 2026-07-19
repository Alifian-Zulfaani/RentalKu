<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          type="text"
          class="form-input"
          placeholder="Cari barang..."
          v-model="search"
          @input="fetchData"
        />
        <select class="form-input" v-model="filterStatus" @change="fetchData">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-primary" @click="openFormModal()">
          <Plus :size="18" /> Tambah Barang
        </button>
      </div>
    </div>
    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Barang</th>
              <th>Kategori</th>
              <th>Stok (Tersedia)</th>
              <th>Tarif/Hari</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in items" :key="i.id">
              <td>
                <strong>{{ i.name }}</strong>
              </td>
              <td>{{ i.category_name || "-" }}</td>
              <td>{{ i.stock }} ({{ i.available_stock }})</td>
              <td>{{ formatRp(i.rate_daily) }}</td>
              <td>
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
                  >{{ i.status }}</span
                >
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-icon text-info"
                    @click="openFormModal(i)"
                    title="Edit"
                  >
                    <Edit :size="18" />
                  </button>
                  <button
                    class="btn-icon text-danger"
                    @click="confirmDelete(i)"
                    title="Hapus"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="6" class="text-center text-muted">Tidak ada data</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button
          class="btn btn-secondary btn-sm"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          Prev
        </button>
        <span class="page-info"
          >{{ pagination.page }} / {{ pagination.totalPages }}</span
        >
        <button
          class="btn btn-secondary btn-sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          Next
        </button>
      </div>
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
                  <input
                    type="number"
                    class="form-input"
                    v-model="formData.rate_daily"
                    min="0"
                    required
                  />
                </div>
                <div class="col">
                  <label class="form-label">Status</label>
                  <select class="form-input" v-model="formData.status" required>
                    <option value="active">Aktif</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { Plus, Edit, Trash2 } from "lucide-vue-next";
import ConfirmModal from "../../components/admin/ConfirmModal.vue";

const items = ref([]);
const categories = ref([]);
const pagination = reactive({ page: 1, totalPages: 1 });
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
  status: "active",
});

// Delete State
const showDeleteModal = ref(false);
const selectedItem = ref(null);

const formatRp = (v) => "Rp" + (v || 0).toLocaleString("id-ID");

async function fetchData() {
  try {
    const { data } = await api.get("/inventory", {
      params: {
        search: search.value,
        status: filterStatus.value,
        page: pagination.page,
      },
    });
    items.value = data.data;
    Object.assign(pagination, data.pagination);

    if (!categories.value.length) {
      const catRes = await api.get("/inventory/categories");
      categories.value = catRes.data;
    }
  } catch (e) {
    console.error(e);
  }
}
function changePage(p) {
  pagination.page = p;
  fetchData();
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
      status: item.status,
    });
  } else {
    Object.assign(formData, {
      id: null,
      name: "",
      category_id: "",
      stock: 0,
      rate_daily: 0,
      status: "active",
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
    fetchData();
  } catch (e) {
    alert(e.response?.data?.message || "Terjadi kesalahan");
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
    fetchData();
  } catch (e) {
    alert(e.response?.data?.message || "Gagal menghapus");
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(fetchData);
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
  gap: 8px;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}
.text-info {
  color: var(--info);
}
.text-danger {
  color: var(--danger);
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
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
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
