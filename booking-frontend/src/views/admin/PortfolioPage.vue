<template>
  <div class="admin-page-stack">
    <section class="page-intro-panel">
      <div>
        <p class="section-index">KARYA STUDIO</p>
        <h2>Portofolio</h2>
        <p>Foto aktif tampil di beranda dan halaman portofolio publik.</p>
      </div>
    </section>
    <section class="admin-panel">
      <div class="portfolio-admin-head">
        <div>
          <h3>Daftar karya</h3>
          <p class="panel-description">Urutan terkecil tampil lebih dulu.</p>
        </div>
        <button type="button" class="button primary" @click="openNew">
          Tambah karya
        </button>
      </div>
      <AdminDataTable actions
        ><thead>
          <tr>
            <th data-align="left">Karya</th>
            <th data-align="left">Keterangan</th>
            <th data-align="right">Urutan</th>
            <th data-align="center">Tampil</th>
            <th data-align="center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paged" :key="item.id">
            <td data-align="left" data-label="Karya">
              <span class="portfolio-table-item"
                ><img :src="item.image_url" :alt="item.title" /><strong>{{
                  item.title
                }}</strong></span
              >
            </td>
            <td data-align="left" data-label="Keterangan">
              {{ item.caption || "—" }}
            </td>
            <td data-align="right" data-label="Urutan">
              {{ item.sort_order }}
            </td>
            <td data-align="center" data-label="Tampil">
              {{ item.active ? "Aktif" : "Disembunyikan" }}
            </td>
            <td data-align="center" data-label="Aksi">
              <AdminActionButton label="Edit karya" @click="openEdit(item)" />
            </td>
          </tr>
          <tr v-if="!paged.length">
            <td colspan="5" class="table-empty">
              Belum ada karya. Tambahkan foto pertama studio.
            </td>
          </tr>
        </tbody></AdminDataTable
      >
      <div class="table-footer">
        <button type="button" class="button secondary compact" @click="loadAll">
          Muat ulang</button
        ><AdminPagination
          :page="page"
          :total-pages="totalPages"
          :total="portfolio.length"
          @change="page = $event"
        />
      </div>
    </section>
    <AdminDialog
      v-if="editing"
      dialog-class="portfolio-editor"
      title-id="portfolio-editor-title"
      close-label="Tutup editor karya"
      @close="editing = false"
    >
      <template #header>
        <p class="section-index">PORTOFOLIO</p>
        <h2 id="portfolio-editor-title">
          {{ form.id ? "Edit karya" : "Tambah karya" }}
        </h2>
      </template>
      <form
        id="portfolio-editor-form"
        class="admin-form"
        @submit.prevent="submit"
      >
        <label class="field-wide"
          >Judul<input
            v-model.trim="form.title"
            required
            minlength="2"
            maxlength="100" /></label
        ><label class="field-wide"
          >Keterangan<input
            v-model.trim="form.caption"
            maxlength="300" /></label
        ><label class="field-wide"
          >URL gambar<input
            v-model.trim="form.image_url"
            required
            placeholder="/images/foto-karya.jpg atau https://…" /></label
        ><label
          >Urutan<input
            v-model.number="form.sort_order"
            type="number"
            min="0"
            max="9999"
            required /></label
        ><label class="portfolio-active"
          ><input v-model="form.active" type="checkbox" /> Tampilkan di
          situs</label
        >
      </form>
      <template #footer>
        <button type="button" class="button secondary" @click="editing = false">
          Batal
        </button>
        <button
          type="submit"
          form="portfolio-editor-form"
          class="button primary"
        >
          Simpan karya
        </button>
      </template>
    </AdminDialog>
  </div>
</template>
<script setup>
import { computed, reactive, ref, watch } from "vue";
import AdminDialog from "../../components/admin/AdminDialog.vue";
import AdminActionButton from "../../components/admin/AdminActionButton.vue";
import AdminDataTable from "../../components/admin/AdminDataTable.vue";
import AdminPagination from "../../components/admin/AdminPagination.vue";
import { useAdminContext } from "../../stores/context";
const { portfolio, loadAll, savePortfolio } = useAdminContext();
const page = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(portfolio.value.length / 8)),
);
const paged = computed(() =>
  portfolio.value.slice((page.value - 1) * 8, page.value * 8),
);
watch(totalPages, (total) => {
  if (page.value > total) page.value = total;
});
const editing = ref(false);
const form = reactive({
  id: null,
  title: "",
  caption: "",
  image_url: "",
  sort_order: 0,
  active: true,
});
function openNew() {
  Object.assign(form, {
    id: null,
    title: "",
    caption: "",
    image_url: "",
    sort_order: portfolio.value.length + 1,
    active: true,
  });
  editing.value = true;
}
function openEdit(item) {
  Object.assign(form, { ...item, active: Boolean(item.active) });
  editing.value = true;
}
async function submit() {
  if (await savePortfolio({ ...form })) editing.value = false;
}
</script>
