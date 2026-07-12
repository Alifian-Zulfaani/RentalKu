<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <input type="text" class="form-input search-input" placeholder="Cari subscriber..." v-model="search" @input="fetchData">
        <select class="form-input filter-select" v-model="filterStatus" @change="fetchData">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <div class="glass-card table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Nama</th><th>Bisnis</th><th>Email</th><th>WhatsApp</th><th>Pembayaran</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr v-for="s in subscribers" :key="s.id">
              <td><strong>{{ s.name }}</strong></td>
              <td>
                <div>{{ s.business_name || '-' }}</div>
                <small class="text-muted">{{ s.business_type || '' }}</small>
              </td>
              <td>{{ s.email }}</td>
              <td>{{ s.whatsapp }}</td>
              <td>
                <div>{{ formatRp(s.amount) }}</div>
                <small class="text-muted">{{ s.payment_method }} · {{ s.plan }}</small>
              </td>
              <td><span class="badge" :class="'badge-' + statusColor(s.status)">{{ s.status }}</span></td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-success btn-sm" v-if="s.status === 'pending'" @click="updateStatus(s.id, 'confirmed')">✓ Konfirmasi</button>
                  <button class="btn btn-danger btn-sm" v-if="s.status === 'pending'" @click="updateStatus(s.id, 'rejected')">✗ Tolak</button>
                  <button class="btn btn-warning btn-sm" v-if="s.status === 'rejected'" @click="updateStatus(s.id, 'pending')">↩ Pending</button>
                  <button class="btn btn-secondary btn-sm" v-if="s.status !== 'pending'" @click="deleteSubscriber(s.id)">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="!subscribers.length"><td colspan="7" class="text-center text-muted">Tidak ada data</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button class="btn btn-secondary btn-sm" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">Prev</button>
        <span class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button class="btn btn-secondary btn-sm" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">Next</button>
      </div>
    </div>

    <ConfirmModal 
      :isOpen="modal.isOpen"
      :title="modal.title"
      :message="modal.message"
      :confirmClass="modal.confirmClass"
      @cancel="closeModal"
      @confirm="executeModalAction"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'
import ConfirmModal from '../../components/admin/ConfirmModal.vue'

const subscribers = ref([])
const pagination = reactive({ page: 1, totalPages: 1 })
const search = ref('')
const filterStatus = ref('')

const modal = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmClass: 'btn-primary',
  actionType: '',
  targetId: null,
  targetStatus: ''
})

const formatRp = v => 'Rp' + (v || 0).toLocaleString('id-ID')
const statusColor = s => ({ pending: 'warning', confirmed: 'success', rejected: 'danger' }[s] || 'default')

async function fetchData() {
  try {
    const { data } = await api.get('/subscribers', { params: { search: search.value, status: filterStatus.value, page: pagination.page } })
    subscribers.value = data.data; Object.assign(pagination, data.pagination)
  } catch (e) { console.error(e) }
}

function updateStatus(id, status) {
  const actionText = status === 'confirmed' ? 'konfirmasi' : status === 'rejected' ? 'tolak' : 'ubah status'
  modal.title = 'Konfirmasi Status'
  modal.message = `Yakin ingin ${actionText} subscriber ini?`
  modal.confirmClass = status === 'rejected' ? 'btn-danger' : 'btn-primary'
  modal.actionType = 'updateStatus'
  modal.targetId = id
  modal.targetStatus = status
  modal.isOpen = true
}

function deleteSubscriber(id) {
  modal.title = 'Hapus Subscriber'
  modal.message = 'Hapus subscriber ini secara permanen?'
  modal.confirmClass = 'btn-danger'
  modal.actionType = 'delete'
  modal.targetId = id
  modal.isOpen = true
}

function closeModal() {
  modal.isOpen = false
}

async function executeModalAction() {
  const { actionType, targetId, targetStatus } = modal
  closeModal()
  try {
    if (actionType === 'updateStatus') {
      await api.patch(`/subscribers/${targetId}/status`, { status: targetStatus })
    } else if (actionType === 'delete') {
      await api.delete(`/subscribers/${targetId}`)
    }
    fetchData()
  } catch (e) {
    alert('Error')
  }
}

function changePage(p) { pagination.page = p; fetchData() }
onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
.toolbar-left { display: flex; gap: 12px; flex: 1; }
.search-input { max-width: 280px; }
.filter-select { max-width: 180px; }
.table-card { padding: 0; overflow: hidden; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 16px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02); }
.data-table td { padding: 14px 16px; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); }
.action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--border-color); }
.page-info { font-size: 0.9rem; color: var(--text-secondary); }
@media (max-width: 768px) { .toolbar-left { flex-direction: column; } .search-input, .filter-select { max-width: 100%; } }
</style>
