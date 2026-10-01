<template>
  <section class="admin-panel">
    <p class="section-index">02 — KETERSEDIAAN</p>
    <h2>Blokir waktu</h2>
    <p class="panel-description">
      Gunakan saat fotografer libur atau sedang menerima pekerjaan di luar
      sistem.
    </p>
    <form class="admin-form" @submit.prevent="addBlock">
      <label
        >Fotografer<select
          v-model.number="blockForm.professional_id"
          required
          aria-label="Fotografer"
        >
          <option :value="null" disabled>Pilih fotografer</option>
          <option
            v-for="person in professionals"
            :key="person.id"
            :value="person.id"
          >
            {{ person.name }}
          </option>
        </select></label
      ><label
        >Tanggal<input
          v-model="blockForm.date"
          type="date"
          :min="today"
          required
          aria-label="Tanggal" /></label
      ><label
        >Jam mulai<input
          v-model="blockForm.start_time"
          type="time"
          required
          aria-label="Mulai" /></label
      ><label
        >Jam selesai<input
          v-model="blockForm.end_time"
          type="time"
          required
          aria-label="Selesai" /></label
      ><label class="field-wide"
        >Alasan (opsional)<input
          v-model.trim="blockForm.reason"
          maxlength="200"
          placeholder="Alasan (opsional)"
          aria-label="Alasan" /></label
      ><button type="submit" class="button primary">Blokir jadwal</button>
    </form>
    <AdminDataTable actions>
      <thead>
        <tr>
          <th data-align="left">Fotografer</th>
          <th data-align="center">Tanggal</th>
          <th data-align="center">Waktu</th>
          <th data-align="left">Alasan</th>
          <th data-align="center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="block in pagedBlocks" :key="block.id">
          <td data-align="left">{{ block.professional_name }}</td>
          <td data-align="center">{{ block.date }}</td>
          <td data-align="center">
            {{ block.start_time }}–{{ block.end_time }}
          </td>
          <td data-align="left">{{ block.reason || "—" }}</td>
          <td data-align="center">
            <AdminActionButton
              label="Hapus blokir"
              tone="warning"
              @click="requestBlockRemoval(block)"
            />
          </td>
        </tr>
        <tr v-if="!pagedBlocks.length">
          <td colspan="5" class="table-empty">
            Tidak ada jadwal terblokir ke depan.
          </td>
        </tr>
      </tbody>
    </AdminDataTable>
    <div class="table-footer">
      <button type="button" class="button secondary compact" @click="loadAll">
        Muat ulang
      </button>
      <AdminPagination
        :page="page"
        :total-pages="totalPages"
        :total="blocks.length"
        @change="page = $event"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AdminActionButton from "../../components/admin/AdminActionButton.vue";
import AdminDataTable from "../../components/admin/AdminDataTable.vue";
import AdminPagination from "../../components/admin/AdminPagination.vue";
import { useAdminContext } from "../../stores/context";
const {
  blocks,
  blockForm,
  professionals,
  today,
  addBlock,
  requestBlockRemoval,
  loadAll,
} = useAdminContext();
const page = ref(1);
const pageSize = 6;
const totalPages = computed(() =>
  Math.max(1, Math.ceil(blocks.value.length / pageSize)),
);
const pagedBlocks = computed(() =>
  blocks.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
watch(totalPages, (total) => {
  if (page.value > total) page.value = total;
});
</script>
