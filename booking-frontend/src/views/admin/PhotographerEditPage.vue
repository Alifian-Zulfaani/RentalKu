<template>
  <div class="admin-page-stack">
    <div class="page-back-row">
      <router-link
        :to="
          person ? `/admin/photographers/${person.id}` : '/admin/photographers'
        "
        class="back-link"
        ><ArrowLeft :size="16" /> Kembali ke detail</router-link
      >
    </div>
    <template v-if="person">
      <section class="page-intro-panel">
        <div>
          <p class="section-index">EDIT FOTOGRAFER</p>
          <h2>{{ person.name }}</h2>
          <p>
            Perubahan profil, jam kerja, dan harga dipisahkan per bagian agar
            lebih aman dikelola.
          </p>
        </div>
      </section>
      <section class="admin-panel">
        <p class="section-index">01 — PROFIL</p>
        <h2>Identitas fotografer</h2>
        <form class="site-form" @submit.prevent="saveProfessional(person)">
          <label>Nama<input v-model.trim="person.name" required /></label>
          <label v-if="isCompany"
            >Subdomain<input
              v-model.trim="person.slug"
              required
              pattern="[a-z0-9-]{2,40}"
          /></label>
          <label class="wide"
            >Spesialisasi<input v-model.trim="person.title" required
          /></label>
          <label class="wide"
            >Biografi<textarea
              v-model.trim="person.bio"
              rows="4"
              required
            ></textarea>
          </label>
          <label
            >URL foto<input
              v-model.trim="person.photo_url"
              placeholder="/images/fotografer.png"
          /></label>
          <label
            >Headline<input v-model.trim="person.headline" maxlength="140"
          /></label>
          <label class="wide"
            >Pendekatan<textarea
              v-model.trim="person.approach"
              rows="4"
              maxlength="1000"
            ></textarea>
          </label>
          <label v-if="isCompany" class="check-label wide"
            ><input
              v-model="person.active"
              type="checkbox"
              :true-value="1"
              :false-value="0"
            />
            Tampilkan fotografer di halaman publik</label
          >
          <div class="form-actions wide">
            <button type="submit" class="button primary">Simpan profil</button>
          </div>
        </form>
      </section>
      <section class="admin-panel">
        <p class="section-index">02 — JAM KERJA</p>
        <h2>Jadwal mingguan</h2>
        <p class="panel-description">
          Jadwal ini menjadi dasar slot yang tampil pada kalender reservasi
          publik.
        </p>
        <div v-if="scheduleDrafts[person.id]" class="schedule-list">
          <label v-for="(day, index) in weekdays" :key="day">
            <input
              type="checkbox"
              :checked="Boolean(scheduleDrafts[person.id]?.[index])"
              @change="toggleDay(person.id, index, $event.target.checked)"
            />
            {{ day }}
            <template v-if="scheduleDrafts[person.id]?.[index]">
              <input
                v-model="scheduleDrafts[person.id][index].start_time"
                type="time"
              /><span>–</span
              ><input
                v-model="scheduleDrafts[person.id][index].end_time"
                type="time"
              />
            </template>
          </label>
        </div>
        <button
          type="button"
          class="button primary"
          @click="saveSchedule(person.id)"
        >
          Simpan jam kerja
        </button>
      </section>
      <section class="admin-panel">
        <p class="section-index">03 — PAKET & HARGA</p>
        <h2>Layanan fotografer</h2>
        <p class="panel-description">
          Aktifkan layanan yang ditawarkan dan sesuaikan harga khusus fotografer
          ini.
        </p>
        <div class="offering-list">
          <div v-for="item in offerings" :key="item.service_id">
            <span
              ><strong>{{ item.name }}</strong
              ><small
                >{{ item.duration_minutes }} menit · dasar
                {{ money(item.base_price) }}</small
              ></span
            >
            <label
              >Harga<input
                v-model.number="item.price"
                type="number"
                min="0"
                step="1000"
            /></label>
            <label class="check-label"
              ><input
                v-model="item.active"
                type="checkbox"
                :true-value="1"
                :false-value="0"
              />
              Aktif</label
            >
          </div>
        </div>
        <p v-if="!offerings.length" class="empty-time">
          Belum ada layanan studio yang dapat dipilih.
        </p>
        <button
          v-if="offerings.length"
          type="button"
          class="button primary"
          @click="saveOfferings"
        >
          Simpan paket & harga
        </button>
      </section>
    </template>
    <section v-else class="admin-panel empty-detail-state">
      Fotografer tidak ditemukan atau data masih dimuat.
    </section>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import { useAdminContext } from "../../stores/context";

const route = useRoute();
const {
  professionals,
  isCompany,
  offerings,
  selectedOfferingPro,
  scheduleDrafts,
  weekdays,
  toggleDay,
  saveSchedule,
  saveProfessional,
  saveOfferings,
  money,
} = useAdminContext();
const person = computed(() =>
  professionals.value.find((item) => item.id === Number(route.params.id)),
);
watch(
  person,
  (value) => {
    if (value) selectedOfferingPro.value = value.id;
  },
  { immediate: true },
);
</script>
