<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          type="text"
          class="form-input"
          placeholder="Cari pelanggan..."
          v-model="search"
          @input="fetchData"
        />
      </div>
    </div>
    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kontak</th>
              <th>Total Order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td>
                <strong>{{ c.name }}</strong>
              </td>
              <td>
                <div>{{ c.whatsapp }}</div>
                <small class="text-muted">{{ c.email || "-" }}</small>
              </td>
              <td>{{ c.total_orders }} Order</td>
              <td>
                <span
                  class="badge"
                  :class="c.is_blacklisted ? 'badge-danger' : 'badge-success'"
                  >{{ c.is_blacklisted ? "Blacklisted" : "Aktif" }}</span
                >
              </td>
            </tr>
            <tr v-if="!customers.length">
              <td colspan="4" class="text-center text-muted">
                Tidak ada data pelanggan
              </td>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";

const customers = ref([]);
const pagination = reactive({ page: 1, totalPages: 1 });
const search = ref("");

async function fetchData() {
  try {
    const { data } = await api.get("/customers", {
      params: { search: search.value, page: pagination.page },
    });
    customers.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (e) {
    console.error(e);
  }
}
function changePage(p) {
  pagination.page = p;
  fetchData();
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
