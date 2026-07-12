<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <input type="text" class="form-input" placeholder="Cari nomor order/nama..." v-model="search" @input="fetchData">
        <select class="form-input" v-model="filterStatus" @change="fetchData">
          <option value="">Semua Status</option>
          <option value="booking">Booking</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
    </div>
    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>No. Order</th><th>Pelanggan</th><th>Durasi</th><th>Total Tagihan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td><code>{{ o.order_number }}</code></td>
              <td><div>{{ o.customer_name || '-' }}</div><small class="text-muted">{{ o.customer_whatsapp }}</small></td>
              <td><div>{{ formatDate(o.start_date) }}</div><small class="text-muted">s/d {{ formatDate(o.end_date) }}</small></td>
              <td>{{ formatRp(o.total_amount) }}</td>
              <td><span class="badge" :class="'badge-' + statusColor(o.status)">{{ o.status }}</span></td>
              <td>
                <div class="action-buttons">
                  <button v-if="o.status === 'booking'" class="btn-icon text-success" @click="confirmStatus(o, 'active')" title="Mulai Sewa"><PlayCircle :size="18" /></button>
                  <button v-if="o.status === 'active' || o.status === 'late'" class="btn-icon text-info" @click="confirmStatus(o, 'completed')" title="Selesaikan"><CheckCircle :size="18" /></button>
                  <button v-if="o.status === 'booking'" class="btn-icon text-warning" @click="confirmStatus(o, 'cancelled')" title="Batalkan"><XCircle :size="18" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="!orders.length"><td colspan="6" class="text-center text-muted">Tidak ada data order</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button class="btn btn-secondary btn-sm" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">Prev</button>
        <span class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button class="btn btn-secondary btn-sm" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">Next</button>
      </div>
    </div>

    <!-- Status Confirmation Modal -->
    <ConfirmModal
      v-model:isOpen="showStatusModal"
      :title="statusModalTitle"
      :message="statusModalMessage"
      :type="statusModalType"
      :confirmText="statusModalConfirmText"
      :confirmBtnClass="statusModalConfirmClass"
      :isLoading="isSubmitting"
      @confirm="executeStatusChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '../../services/api'
import { PlayCircle, CheckCircle, XCircle } from 'lucide-vue-next'
import ConfirmModal from '../../components/admin/ConfirmModal.vue'

const orders = ref([])
const pagination = reactive({ page: 1, totalPages: 1 })
const search = ref('')
const filterStatus = ref('')

// Status Modal State
const showStatusModal = ref(false)
const selectedOrder = ref(null)
const targetStatus = ref('')
const isSubmitting = ref(false)

const formatRp = v => 'Rp' + (v || 0).toLocaleString('id-ID')
const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'
const statusColor = s => ({ booking: 'info', active: 'success', late: 'danger', completed: 'default', cancelled: 'warning' }[s] || 'default')

async function fetchData() {
  try {
    const { data } = await api.get('/orders', { params: { search: search.value, status: filterStatus.value, page: pagination.page } })
    orders.value = data.data; Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
}
function changePage(p) { pagination.page = p; fetchData() }

// Status Change Logic
const statusModalTitle = computed(() => {
  if (targetStatus.value === 'active') return 'Mulai Masa Sewa'
  if (targetStatus.value === 'completed') return 'Selesaikan Pesanan'
  return 'Batalkan Pesanan'
})
const statusModalMessage = computed(() => {
  if (targetStatus.value === 'active') return `Tandai pesanan ${selectedOrder.value?.order_number} sebagai sedang disewa/aktif?`
  if (targetStatus.value === 'completed') return `Apakah pelanggan telah mengembalikan barang dan pesanan ${selectedOrder.value?.order_number} selesai?`
  return `Yakin ingin membatalkan pesanan ${selectedOrder.value?.order_number}?`
})
const statusModalType = computed(() => targetStatus.value === 'cancelled' ? 'danger' : 'info')
const statusModalConfirmText = computed(() => {
  if (targetStatus.value === 'active') return 'Ya, Mulai'
  if (targetStatus.value === 'completed') return 'Ya, Selesai'
  return 'Ya, Batalkan'
})
const statusModalConfirmClass = computed(() => {
  if (targetStatus.value === 'active') return 'btn-success'
  if (targetStatus.value === 'completed') return 'btn-info'
  return 'btn-danger'
})

function confirmStatus(order, status) {
  selectedOrder.value = order
  targetStatus.value = status
  showStatusModal.value = true
}

async function executeStatusChange() {
  isSubmitting.value = true
  try {
    await api.put(`/orders/${selectedOrder.value.id}/status`, { status: targetStatus.value })
    showStatusModal.value = false
    fetchData()
  } catch (e) {
    alert(e.response?.data?.message || 'Gagal mengubah status')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; margin-bottom: 20px; }
.toolbar-left { display: flex; gap: 12px; }
.table-card { padding: 0; overflow: hidden; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 16px; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02); }
.data-table td { padding: 14px 16px; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.data-table code { font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--border-color); }
.action-buttons { display: flex; gap: 8px; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-icon:hover { background: rgba(255,255,255,0.1); }
.text-success { color: var(--success); }
.text-info { color: var(--info); }
.text-warning { color: var(--warning); }
</style>
