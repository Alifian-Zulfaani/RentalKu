<template>
  <div class="admin-page-stack">
    <section class="page-intro-panel">
      <div>
        <p class="section-index">KATALOG STUDIO</p>
        <h2>Layanan fotografi</h2>
        <p>
          Kelola paket dasar studio. Harga khusus setiap fotografer diatur dari
          menu Fotografer.
        </p>
      </div>
      <button
        type="button"
        class="button primary"
        @click="showCreate = !showCreate"
      >
        <Plus :size="17" /> {{ showCreate ? "Tutup form" : "Tambah layanan" }}
      </button>
    </section>
    <Transition name="section-slide">
      <section v-if="showCreate" class="admin-panel">
        <p class="section-index">LAYANAN BARU</p>
        <h2>Tambah layanan</h2>
        <form class="admin-form" @submit.prevent="createService">
          <label
            >Nama layanan<input v-model.trim="newService.name" required
          /></label>
          <label
            >Durasi (menit)<input
              v-model.number="newService.duration_minutes"
              type="number"
              min="30"
              max="480"
              step="30"
              required
          /></label>
          <label class="field-wide"
            >Deskripsi<textarea
              v-model.trim="newService.description"
              rows="3"
              required
            ></textarea>
          </label>
          <label
            >Harga dasar (Rp)<input
              v-model.number="newService.price"
              type="number"
              min="0"
              step="1000"
              required
          /></label>
          <div class="form-actions">
            <button
              type="button"
              class="button secondary"
              @click="showCreate = false"
            >
              Batal</button
            ><button type="submit" class="button primary">
              Simpan layanan
            </button>
          </div>
        </form>
      </section>
    </Transition>
    <section class="admin-panel list-panel">
      <AdminDataTable actions>
        <thead>
          <tr>
            <th data-align="left">Layanan</th>
            <th data-align="center">Durasi</th>
            <th data-align="right">Harga dasar</th>
            <th data-align="center">Status</th>
            <th data-align="center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in pagedServices" :key="service.id">
            <td data-align="left">
              <strong>{{ service.name }}</strong
              ><small class="cell-subtitle">{{ service.description }}</small>
            </td>
            <td data-align="center">{{ service.duration_minutes }} menit</td>
            <td data-align="right">{{ money(service.price) }}</td>
            <td data-align="center">
              <span
                class="status-badge"
                :class="
                  service.active
                    ? 'status-badge--confirmed'
                    : 'status-badge--cancelled'
                "
                >{{ service.active ? "Aktif" : "Nonaktif" }}</span
              >
            </td>
            <td data-align="center">
              <AdminActionButton
                label="Edit"
                tone="info"
                @click="openEdit(service)"
                ><template #icon><Pencil :size="15" /></template
              ></AdminActionButton>
            </td>
          </tr>
          <tr v-if="!pagedServices.length">
            <td colspan="5" class="table-empty">Belum ada layanan studio.</td>
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
          :total="services.length"
          @change="page = $event"
        />
      </div>
    </section>
    <Transition name="modal-fade">
      <div
        v-if="selectedService"
        class="booking-dialog-backdrop"
        @click.self="selectedService = null"
      >
        <section
          class="booking-dialog service-edit-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-edit-title"
        >
          <div class="booking-dialog-head">
            <div>
              <p class="section-index">EDIT LAYANAN</p>
              <h2 id="service-edit-title">{{ selectedService.name }}</h2>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              @click="selectedService = null"
            >
              <X :size="19" />
            </button>
          </div>
          <form class="dialog-form" @submit.prevent="updateService">
            <label
              >Nama layanan<input v-model.trim="selectedService.name" required
            /></label>
            <label
              >Deskripsi<textarea
                v-model.trim="selectedService.description"
                rows="4"
                required
              ></textarea>
            </label>
            <div class="dialog-form-grid">
              <label
                >Durasi<input
                  v-model.number="selectedService.duration_minutes"
                  type="number"
                  min="30"
                  max="480"
                  step="30"
                  required /></label
              ><label
                >Harga dasar<input
                  v-model.number="selectedService.price"
                  type="number"
                  min="0"
                  step="1000"
                  required
              /></label>
            </div>
            <label class="check-label"
              ><input
                v-model="selectedService.active"
                type="checkbox"
                :true-value="1"
                :false-value="0"
              />
              Layanan aktif</label
            >
            <div class="cancellation-actions">
              <button
                type="button"
                class="button secondary"
                @click="selectedService = null"
              >
                Batal</button
              ><button type="submit" class="button primary">
                Simpan perubahan
              </button>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Pencil, Plus, X } from "lucide-vue-next";
import AdminActionButton from "../../components/admin/AdminActionButton.vue";
import AdminDataTable from "../../components/admin/AdminDataTable.vue";
import AdminPagination from "../../components/admin/AdminPagination.vue";
import { useAdminContext } from "../../stores/context";
const { services, newService, addService, saveService, loadAll, money } =
  useAdminContext();
const showCreate = ref(false);
const selectedService = ref(null);
const page = ref(1);
const pageSize = 8;
const totalPages = computed(() =>
  Math.max(1, Math.ceil(services.value.length / pageSize)),
);
const pagedServices = computed(() =>
  services.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
watch(totalPages, (total) => {
  if (page.value > total) page.value = total;
});
async function createService() {
  if (await addService()) showCreate.value = false;
}
function openEdit(service) {
  selectedService.value = { ...service };
}
async function updateService() {
  if (!(await saveService(selectedService.value))) return;
  const savedService = services.value.find(
    (service) => service.id === selectedService.value.id,
  );
  if (savedService) Object.assign(savedService, selectedService.value);
  selectedService.value = null;
}
</script>
