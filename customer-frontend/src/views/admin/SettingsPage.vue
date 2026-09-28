<template>
  <div class="settings-page">
    <AdminPageHeader
      title="Pengaturan website"
      description="Kelola identitas brand, informasi publik, kontak, dan warna utama aplikasi."
    />
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
          <div class="form-group">
            <label class="form-label">Deskripsi Singkat</label>
            <textarea
              class="form-input"
              v-model="config.description"
              rows="2"
              maxlength="1000"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label"
              >URL Logo <span class="text-muted">(opsional)</span></label
            >
            <input
              type="url"
              class="form-input"
              v-model.trim="config.logo_url"
              placeholder="https://..."
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Warna Utama (Hex)</label>
              <div class="color-control">
                <input
                  type="color"
                  v-model="config.primary_color"
                  class="color-swatch"
                />
                <input
                  type="text"
                  class="form-input"
                  v-model="config.primary_color"
                  placeholder="#2f5948"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Warna Sekunder (Hex)</label>
              <div class="color-control">
                <input
                  type="color"
                  v-model="config.secondary_color"
                  class="color-swatch"
                />
                <input
                  type="text"
                  class="form-input"
                  v-model="config.secondary_color"
                  placeholder="#c66e46"
                />
              </div>
            </div>
          </div>
          <div class="palette-picker">
            <div class="palette-heading">
              <div>
                <h5>Preset warna outdoor</h5>
                <p>
                  Pilih kombinasi siap pakai. Warna tetap dapat disesuaikan
                  manual setelahnya.
                </p>
              </div>
              <span v-if="activePalette">Aktif: {{ activePalette.name }}</span>
            </div>
            <div class="palette-grid">
              <button
                v-for="palette in colorPalettes"
                :key="palette.name"
                type="button"
                class="palette-option"
                :class="{ active: activePalette?.name === palette.name }"
                :aria-label="`Gunakan palet ${palette.name}`"
                @click="applyPalette(palette)"
              >
                <span class="palette-swatches">
                  <i :style="{ background: palette.primary }"></i>
                  <i :style="{ background: palette.secondary }"></i>
                </span>
                <span class="palette-copy">
                  <strong>{{ palette.name }}</strong>
                  <small>{{ palette.primary }} · {{ palette.secondary }}</small>
                </span>
                <span v-if="palette.recommended" class="recommended-label"
                  >Rekomendasi</span
                >
              </button>
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
        </div>
      </form>
      <div v-else class="text-center text-muted" style="padding: 40px">
        Memuat konfigurasi...
      </div>
    </div>
    <ToastMessage
      :message="toast.message"
      :type="toast.type"
      @close="toast.message = ''"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import api from "../../services/api";
import ToastMessage from "../../components/shared/ToastMessage.vue";
import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import { getApiError } from "../../utils/formatters";

const config = ref(null);
const loading = ref(false);
const toast = ref({ message: "", type: "success" });

const colorPalettes = [
  {
    name: "Hutan & Tanah Liat",
    primary: "#2F5948",
    secondary: "#C66E46",
    recommended: true,
  },
  { name: "Pinus & Amber", primary: "#234638", secondary: "#D09A45" },
  { name: "Lumut & Batu Pasir", primary: "#586B45", secondary: "#C49A63" },
  { name: "Alpine & Karat", primary: "#315B5C", secondary: "#B96947" },
  { name: "Rimba & Emas", primary: "#1F513C", secondary: "#C99335" },
  { name: "Cemara & Pakis", primary: "#344E41", secondary: "#7C9A62" },
];

const activePalette = computed(() =>
  colorPalettes.find(
    (palette) =>
      palette.primary.toLowerCase() ===
        config.value?.primary_color?.toLowerCase() &&
      palette.secondary.toLowerCase() ===
        config.value?.secondary_color?.toLowerCase(),
  ),
);

function applyPalette(palette) {
  config.value.primary_color = palette.primary;
  config.value.secondary_color = palette.secondary;
}

async function fetchConfig() {
  try {
    const { data } = await api.get("/site-config");
    config.value = data;
  } catch (e) {
    toast.value = {
      message: getApiError(e, "Pengaturan belum dapat dimuat."),
      type: "error",
    };
  }
}

async function saveConfig() {
  loading.value = true;
  try {
    const { data } = await api.put("/site-config", config.value);
    config.value = data;
    document.documentElement.style.setProperty(
      "--brand-primary",
      data.primary_color,
    );
    document.documentElement.style.setProperty(
      "--brand-secondary",
      data.secondary_color,
    );
    toast.value = {
      message: "Pengaturan website berhasil disimpan.",
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: getApiError(err, "Pengaturan belum dapat disimpan."),
      type: "error",
    };
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
.color-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-swatch {
  width: 56px;
  height: 43px;
  flex: 0 0 auto;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface);
  cursor: pointer;
}
.palette-picker {
  margin: 6px 0 28px;
  padding: 18px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--surface-subtle);
}
.palette-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.palette-heading h5 {
  font-family: var(--font-display);
  font-size: 0.93rem;
}
.palette-heading p {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 0.76rem;
}
.palette-heading > span {
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--brand-primary) 11%, var(--surface));
  color: var(--brand-primary);
  font-size: 0.68rem;
  font-weight: 800;
}
.palette-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}
.palette-option {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  padding: 11px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  text-align: left;
  transition:
    border-color 0.16s,
    box-shadow 0.16s;
}
.palette-option:hover,
.palette-option.active {
  border-color: var(--brand-primary);
}
.palette-option.active {
  box-shadow: 0 0 0 2px
    color-mix(in srgb, var(--brand-primary) 12%, transparent);
}
.palette-swatches {
  display: grid;
  width: 44px;
  height: 32px;
  flex: 0 0 auto;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 5px;
}
.palette-swatches i {
  display: block;
}
.palette-copy {
  display: grid;
  min-width: 0;
}
.palette-copy strong {
  font-size: 0.78rem;
}
.palette-copy small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 0.65rem;
}
.recommended-label {
  position: absolute;
  top: 7px;
  right: 7px;
  color: var(--brand-secondary);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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
  .palette-grid {
    grid-template-columns: 1fr;
  }
  .palette-heading {
    flex-direction: column;
  }
}
</style>
