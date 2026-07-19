<template>
  <div class="settings-page">
    <div class="settings-card glass-card">
      <div class="card-header">
        <h3>Konfigurasi Website Utama</h3>
        <p>Atur tampilan dan informasi landing page publik Anda.</p>
      </div>

      <form @submit.prevent="saveConfig" v-if="config">
        <div class="form-section">
          <h4>Identitas Brand</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Bisnis</label>
              <input
                type="text"
                class="form-input"
                v-model="config.business_name"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Tagline Singkat</label>
              <input type="text" class="form-input" v-model="config.tagline" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Warna Utama (Hex)</label>
              <div style="display: flex; gap: 10px">
                <input
                  type="color"
                  v-model="config.primary_color"
                  style="
                    height: 46px;
                    width: 60px;
                    padding: 0;
                    background: none;
                    border: none;
                    cursor: pointer;
                  "
                />
                <input
                  type="text"
                  class="form-input"
                  v-model="config.primary_color"
                  placeholder="#16a34a"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Warna Sekunder (Hex)</label>
              <div style="display: flex; gap: 10px">
                <input
                  type="color"
                  v-model="config.secondary_color"
                  style="
                    height: 46px;
                    width: 60px;
                    padding: 0;
                    background: none;
                    border: none;
                    cursor: pointer;
                  "
                />
                <input
                  type="text"
                  class="form-input"
                  v-model="config.secondary_color"
                  placeholder="#854d0e"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>Hero Section (Bagian Atas)</h4>
          <div class="form-group">
            <label class="form-label">Judul Utama</label>
            <input type="text" class="form-input" v-model="config.hero_title" />
          </div>
          <div class="form-group">
            <label class="form-label">Sub-Judul</label>
            <textarea
              class="form-input"
              v-model="config.hero_subtitle"
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h4>Tentang & Kontak</h4>
          <div class="form-group">
            <label class="form-label">Deskripsi Bisnis</label>
            <textarea
              class="form-input"
              v-model="config.about_text"
              rows="4"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nomor WhatsApp</label>
              <input type="text" class="form-input" v-model="config.whatsapp" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Kontak</label>
              <input type="email" class="form-input" v-model="config.email" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Lengkap</label>
            <textarea
              class="form-input"
              v-model="config.address"
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="loading"
          >
            {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
          <div v-if="successMsg" class="alert alert-success mt-2">
            {{ successMsg }}
          </div>
        </div>
      </form>
      <div v-else class="text-center text-muted" style="padding: 40px">
        Memuat konfigurasi...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const config = ref(null);
const loading = ref(false);
const successMsg = ref("");

async function fetchConfig() {
  try {
    const { data } = await api.get("/site-config");
    config.value = data;
  } catch (e) {
    console.error(e);
  }
}

async function saveConfig() {
  loading.value = true;
  successMsg.value = "";
  try {
    await api.put("/site-config", config.value);
    successMsg.value = "Pengaturan berhasil disimpan!";
    setTimeout(() => (successMsg.value = ""), 3000);
  } catch (err) {
    alert("Gagal menyimpan pengaturan");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchConfig);
</script>

<style scoped>
.settings-card {
  padding: 32px;
  max-width: 800px;
}
.card-header {
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}
.card-header h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}
.card-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}
.form-section {
  margin-bottom: 32px;
}
.form-section h4 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-primary);
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  padding: 12px;
  border-radius: var(--radius-sm);
  text-align: center;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
