<template>
  <div class="admin-page-stack">
    <section class="page-intro-panel">
      <div>
        <p class="section-index">TIM FOTOGRAFI</p>
        <h2>{{ isCompany ? "Daftar fotografer" : "Profil fotografer" }}</h2>
        <p>
          Kelola profil, jadwal mingguan, layanan, dan harga dari halaman setiap
          fotografer.
        </p>
      </div>
      <router-link
        v-if="isCompany"
        to="/admin/photographers/new"
        class="button primary"
      >
        <Plus :size="17" /> Tambah fotografer
      </router-link>
    </section>

    <section class="admin-panel list-panel">
      <div class="booking-toolbar">
        <label class="table-search">
          <Search :size="17" />
          <input
            v-model.trim="search"
            type="search"
            placeholder="Cari nama, spesialisasi, atau subdomain…"
          />
        </label>
        <span class="record-count">{{ filtered.length }} fotografer</span>
      </div>
      <AdminDataTable actions>
        <thead>
          <tr>
            <th data-align="left">Fotografer</th>
            <th data-align="left">Spesialisasi</th>
            <th data-align="left">Subdomain</th>
            <th data-align="center">Jadwal aktif</th>
            <th data-align="center">Status</th>
            <th data-align="center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in pagedProfessionals" :key="person.id">
            <td data-align="left">
              <span class="photographer-cell">
                <span class="photographer-thumb">
                  <img
                    v-if="person.photo_url"
                    :src="person.photo_url"
                    :alt="`Foto ${person.name}`"
                  />
                  <span v-else>{{ initials(person.name) }}</span>
                </span>
                <span
                  ><strong>{{ person.name }}</strong
                  ><small>{{
                    person.headline || "Profil belum dilengkapi"
                  }}</small></span
                >
              </span>
            </td>
            <td data-align="left">{{ person.title }}</td>
            <td data-align="left">
              <code>{{ person.slug }}</code>
            </td>
            <td data-align="center">{{ person.schedule.length }} hari</td>
            <td data-align="center">
              <span
                class="status-badge"
                :class="
                  person.active
                    ? 'status-badge--confirmed'
                    : 'status-badge--cancelled'
                "
              >
                {{ person.active ? "Aktif" : "Nonaktif" }}
              </span>
            </td>
            <td data-align="center">
              <div class="admin-action-group">
                <AdminActionButton
                  label="Detail"
                  @click="openDetail(person.id)"
                >
                  <template #icon><Eye :size="15" /></template>
                </AdminActionButton>
                <AdminActionButton
                  label="Edit"
                  tone="info"
                  @click="openEdit(person.id)"
                >
                  <template #icon><Pencil :size="15" /></template>
                </AdminActionButton>
              </div>
            </td>
          </tr>
          <tr v-if="!pagedProfessionals.length">
            <td colspan="6" class="table-empty">
              Tidak ada fotografer yang sesuai pencarian.
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
          :total="filtered.length"
          @change="page = $event"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, Pencil, Plus, Search } from "lucide-vue-next";
import AdminActionButton from "../../components/admin/AdminActionButton.vue";
import AdminDataTable from "../../components/admin/AdminDataTable.vue";
import AdminPagination from "../../components/admin/AdminPagination.vue";
import { useAdminContext } from "../../stores/context";

const router = useRouter();
const { professionals, isCompany, loadAll } = useAdminContext();
const search = ref("");
const page = ref(1);
const pageSize = 8;
const filtered = computed(() => {
  const term = search.value.toLowerCase();
  if (!term) return professionals.value;
  return professionals.value.filter((person) =>
    [person.name, person.title, person.slug].some((value) =>
      String(value).toLowerCase().includes(term),
    ),
  );
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);
const pagedProfessionals = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
watch(search, () => (page.value = 1));
watch(totalPages, (total) => {
  if (page.value > total) page.value = total;
});
const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const openDetail = (id) => router.push(`/admin/photographers/${id}`);
const openEdit = (id) => router.push(`/admin/photographers/${id}/edit`);
</script>
