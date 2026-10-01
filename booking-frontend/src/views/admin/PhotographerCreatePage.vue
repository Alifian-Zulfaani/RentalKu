<template>
  <div class="admin-page-stack narrow-admin-page">
    <div class="page-back-row">
      <router-link to="/admin/photographers" class="back-link"
        ><ArrowLeft :size="16" /> Kembali ke daftar</router-link
      >
    </div>
    <section class="page-intro-panel">
      <div>
        <p class="section-index">FOTOGRAFER BARU</p>
        <h2>Tambahkan fotografer</h2>
        <p>
          Isi identitas utama terlebih dahulu. Jadwal dan harga dapat dilengkapi
          setelah profil dibuat.
        </p>
      </div>
    </section>
    <section class="admin-panel">
      <form class="site-form" @submit.prevent="submit">
        <label
          >Nama fotografer<input
            v-model.trim="newProfessional.name"
            required
            minlength="2"
        /></label>
        <label
          >Subdomain<input
            v-model.trim="newProfessional.slug"
            required
            pattern="[a-z0-9-]{2,40}"
            placeholder="nama-fotografer"
        /></label>
        <label class="wide"
          >Spesialisasi<input
            v-model.trim="newProfessional.title"
            required
            placeholder="Contoh: Portrait & family photographer"
        /></label>
        <label class="wide"
          >Biografi<textarea
            v-model.trim="newProfessional.bio"
            rows="4"
            required
          ></textarea>
        </label>
        <label
          >URL foto<input
            v-model.trim="newProfessional.photo_url"
            placeholder="/images/fotografer.png"
        /></label>
        <label
          >Headline<input
            v-model.trim="newProfessional.headline"
            maxlength="140"
            placeholder="Kalimat pendek untuk landing page"
        /></label>
        <label class="wide"
          >Pendekatan fotografer<textarea
            v-model.trim="newProfessional.approach"
            rows="4"
            maxlength="1000"
          ></textarea>
        </label>
        <div class="form-actions wide">
          <router-link to="/admin/photographers" class="button secondary"
            >Batal</router-link
          >
          <button type="submit" class="button primary" :disabled="saving">
            {{ saving ? "Menyimpan…" : "Simpan fotografer" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import { useAdminContext } from "../../stores/context";

const router = useRouter();
const { newProfessional, addProfessional } = useAdminContext();
const saving = ref(false);
async function submit() {
  saving.value = true;
  const id = await addProfessional();
  saving.value = false;
  if (id) router.replace(`/admin/photographers/${id}`);
}
</script>
