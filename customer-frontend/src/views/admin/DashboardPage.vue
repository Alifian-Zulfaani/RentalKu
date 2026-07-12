<template>
  <div class="dashboard">
    <div class="stats-row">
      <div class="stat-card glass-card" v-for="(s, i) in statCards" :key="i">
        <div class="stat-card-icon" :style="{ background: s.bg }">
          <component :is="s.icon" :size="22" :color="s.color" />
        </div>
        <div class="stat-card-info">
          <div class="stat-card-value">{{ s.format ? s.format(stats[s.key]) : stats[s.key] }}</div>
          <div class="stat-card-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
    <div class="recent-section glass-card">
      <div class="section-header">
        <h3>Order Terbaru</h3>
        <router-link to="/admin/orders" class="btn btn-secondary btn-sm">Lihat Semua</router-link>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>No. Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Tanggal</th></tr></thead>
          <tbody>
            <tr v-for="o in stats.recentOrders" :key="o.id">
              <td><code>{{ o.order_number }}</code></td>
              <td>{{ o.customer_name || '-' }}</td>
              <td><span class="badge" :class="'badge-' + statusColor(o.status)">{{ o.status }}</span></td>
              <td>{{ formatRp(o.total_amount) }}</td>
              <td>{{ formatDate(o.created_at) }}</td>
            </tr>
            <tr v-if="!stats.recentOrders?.length"><td colspan="5" class="text-center text-muted">Belum ada order</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import api from '../../services/api'
import { ShoppingCart, Package, Users, DollarSign, AlertTriangle, Activity } from 'lucide-vue-next'

const stats = reactive({ totalOrders: 0, activeOrders: 0, totalCustomers: 0, totalInventory: 0, totalRevenue: 0, lateOrders: 0, recentOrders: [] })

const statCards = [
  { key: 'totalOrders', label: 'Total Order', icon: ShoppingCart, color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  { key: 'activeOrders', label: 'Order Aktif', icon: Activity, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'totalInventory', label: 'Total Barang', icon: Package, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'totalCustomers', label: 'Total Customer', icon: Users, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'totalRevenue', label: 'Pendapatan', icon: DollarSign, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', format: v => formatRp(v) },
  { key: 'lateOrders', label: 'Terlambat', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
]

const formatRp = v => 'Rp' + (v || 0).toLocaleString('id-ID')
const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
const statusColor = s => ({ booking: 'info', active: 'success', late: 'danger', completed: 'default', cancelled: 'warning' }[s] || 'default')

onMounted(async () => {
  try { const { data } = await api.get('/orders/stats'); Object.assign(stats, data) } catch (e) { console.error(e) }
})
</script>

<style scoped>
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 24px; }
.stat-card-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-card-value { font-size: 1.5rem; font-weight: 800; }
.stat-card-label { font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }
.recent-section { padding: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 12px 16px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 14px 16px; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); }
.data-table code { font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
</style>
