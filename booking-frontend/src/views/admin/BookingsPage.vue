<template>
  <section class="admin-panel">
    <div class="section-top">
      <div>
        <p class="section-index">01 — PESANAN</p>
        <h2>Daftar reservasi</h2>
      </div>
    </div>
    <div class="booking-toolbar">
      <input
        v-model.trim="bookingSearch"
        type="search"
        placeholder="Cari pemesan, layanan, atau fotografer…"
        aria-label="Cari reservasi"
      />
      <div class="admin-controls">
        <select v-model="filterStatus" aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="pending">Menunggu</option>
          <option value="confirmed">Terkonfirmasi</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>
    </div>
    <p v-if="bookingsLoading" class="loading-banner" role="status">
      Memuat reservasi…
    </p>
    <AdminDataTable actions wide>
      <thead>
        <tr>
          <th data-align="left">Pemesan</th>
          <th data-align="left">Layanan</th>
          <th data-align="left">Fotografer</th>
          <th data-align="center">Jadwal</th>
          <th data-align="right">Nilai</th>
          <th data-align="center">Status</th>
          <th data-align="center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in bookings" :key="item.id">
          <td data-align="left">
            <strong>{{ item.customer_name }}</strong>
            <small class="cell-subtitle"
              >{{ item.customer_email }} · {{ item.customer_whatsapp }}</small
            >
          </td>
          <td data-align="left">{{ item.service_name }}</td>
          <td data-align="left">{{ item.professional_name }}</td>
          <td data-align="center">
            {{ item.date
            }}<small class="cell-subtitle"
              >{{ item.start_time }}–{{ item.end_time }}</small
            >
          </td>
          <td data-align="right">
            {{ money(item.total) }}
          </td>
          <td data-align="center">
            <span
              class="status-badge"
              :class="`status-badge--${item.status}`"
              >{{ bookingStatusLabel(item.status) }}</span
            >
          </td>
          <td data-align="center">
            <div class="admin-action-group">
              <AdminActionButton
                label="Detail"
                @click="selectedBooking = item"
              />
              <AdminActionButton
                v-if="item.status === 'pending'"
                label="Konfirmasi"
                tone="positive"
                @click="requestStatusChange(item, 'confirmed')"
              />
              <AdminActionButton
                v-if="item.status === 'confirmed'"
                label="Selesaikan"
                tone="info"
                @click="requestStatusChange(item, 'completed')"
              />
              <AdminActionButton
                v-if="['pending', 'confirmed'].includes(item.status)"
                label="Batalkan"
                tone="warning"
                @click="requestStatusChange(item, 'cancelled')"
              />
              <AdminActionButton
                v-if="item.status === 'cancelled'"
                label="Aktifkan"
                tone="positive"
                @click="requestStatusChange(item, 'pending')"
              />
            </div>
          </td>
        </tr>
        <tr v-if="!bookingsLoading && !bookings.length">
          <td colspan="7" class="table-empty">
            Belum ada reservasi pada filter ini.
          </td>
        </tr>
      </tbody>
    </AdminDataTable>
    <div class="table-footer">
      <button
        type="button"
        class="button secondary compact"
        @click="fetchBookings"
      >
        Muat ulang
      </button>
      <AdminPagination
        :page="pagination.page"
        :total-pages="Math.max(1, pagination.totalPages)"
        :total="pagination.total"
        @change="page = $event"
      />
    </div>
  </section>
</template>

<script setup>
import AdminActionButton from "../../components/admin/AdminActionButton.vue";
import AdminDataTable from "../../components/admin/AdminDataTable.vue";
import AdminPagination from "../../components/admin/AdminPagination.vue";
import { useAdminContext } from "../../stores/context";
const {
  money,
  bookingStatusLabel,
  bookings,
  bookingsLoading,
  bookingSearch,
  filterStatus,
  fetchBookings,
  selectedBooking,
  requestStatusChange,
  page,
  pagination,
} = useAdminContext();
</script>
