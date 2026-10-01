<template>
  <div class="admin-page-stack">
    <div class="page-back-row">
      <router-link to="/admin/photographers" class="back-link"
        ><ArrowLeft :size="16" /> Kembali ke daftar</router-link
      >
      <router-link
        v-if="person"
        :to="`/admin/photographers/${person.id}/edit`"
        class="button primary compact"
        ><Pencil :size="15" /> Edit fotografer</router-link
      >
    </div>
    <template v-if="person">
      <section class="photographer-profile-panel">
        <div class="photographer-profile-photo">
          <img
            v-if="person.photo_url"
            :src="person.photo_url"
            :alt="`Foto ${person.name}`"
          />
          <span v-else>{{ initials(person.name) }}</span>
        </div>
        <div class="photographer-profile-copy">
          <div class="profile-heading-line">
            <div>
              <p class="section-index">PROFIL FOTOGRAFER</p>
              <h2>{{ person.name }}</h2>
            </div>
            <span
              class="status-badge"
              :class="
                person.active
                  ? 'status-badge--confirmed'
                  : 'status-badge--cancelled'
              "
              >{{ person.active ? "Aktif" : "Nonaktif" }}</span
            >
          </div>
          <strong>{{ person.title }}</strong>
          <p>{{ person.bio }}</p>
          <dl class="profile-meta-list">
            <div>
              <dt>Subdomain</dt>
              <dd>{{ person.slug }}</dd>
            </div>
            <div>
              <dt>Headline</dt>
              <dd>{{ person.headline || "Belum diisi" }}</dd>
            </div>
            <div>
              <dt>Pendekatan</dt>
              <dd>{{ person.approach || "Belum diisi" }}</dd>
            </div>
          </dl>
        </div>
      </section>
      <div class="detail-grid">
        <section class="admin-panel">
          <p class="section-index">JADWAL MINGGUAN</p>
          <h2>Jam kerja</h2>
          <div class="detail-schedule-list">
            <div v-for="(day, index) in weekdays" :key="day">
              <span>{{ day }}</span>
              <strong v-if="scheduleByDay[index]"
                >{{ scheduleByDay[index].start_time }}–{{
                  scheduleByDay[index].end_time
                }}</strong
              >
              <small v-else>Libur</small>
            </div>
          </div>
        </section>
        <section class="admin-panel">
          <p class="section-index">PAKET & HARGA</p>
          <h2>Layanan aktif</h2>
          <div class="detail-offering-list">
            <div v-for="item in activeOfferings" :key="item.service_id">
              <span
                ><strong>{{ item.name }}</strong
                ><small>{{ item.duration_minutes }} menit</small></span
              >
              <strong>{{ money(item.price) }}</strong>
            </div>
            <p v-if="!activeOfferings.length" class="empty-time">
              Belum ada layanan aktif.
            </p>
          </div>
        </section>
      </div>
    </template>
    <section v-else class="admin-panel empty-detail-state">
      Fotografer tidak ditemukan atau data masih dimuat.
    </section>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Pencil } from "lucide-vue-next";
import { useAdminContext } from "../../stores/context";

const route = useRoute();
const { professionals, offerings, selectedOfferingPro, weekdays, money } =
  useAdminContext();
const person = computed(() =>
  professionals.value.find((item) => item.id === Number(route.params.id)),
);
const scheduleByDay = computed(() =>
  Object.fromEntries(
    (person.value?.schedule || []).map((item) => [item.weekday, item]),
  ),
);
const activeOfferings = computed(() =>
  offerings.value.filter((item) => item.active),
);
watch(
  person,
  (value) => {
    if (value) selectedOfferingPro.value = value.id;
  },
  { immediate: true },
);
const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
</script>
