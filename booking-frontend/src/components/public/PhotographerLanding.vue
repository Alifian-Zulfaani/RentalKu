<template>
  <section class="personal-hero wrap">
    <div class="personal-photo">
      <img
        :src="site.profile.photo_url || '/images/studio-senja-hero.png'"
        :alt="`Potret ${site.profile.name}`"
        fetchpriority="high"
      /><span>{{ site.profile.title }}</span>
    </div>
    <div class="personal-intro">
      <p class="section-index">
        FOTOGRAFER / {{ site.tenant.name.toUpperCase() }}
      </p>
      <p class="personal-overline">Halo, saya</p>
      <h1>{{ site.profile.name }}.</h1>
      <p class="personal-lead">{{ site.profile.bio }}</p>
      <div class="personal-facts">
        <span><MapPin :size="16" /> {{ site.tenant.location }}</span
        ><span><Camera :size="16" /> {{ site.profile.title }}</span>
      </div>
      <div class="hero-actions">
        <a href="#reservasi" class="button primary"
          >Cek jadwal saya <ArrowRight :size="17" /></a
        ><a :href="studioHref" class="under-link">Kenali studio kami</a>
      </div>
    </div>
  </section>
  <section id="tentang" class="personal-about">
    <div class="wrap personal-about-grid">
      <span class="section-index">01 / PENDEKATAN SAYA</span>
      <h2>{{ site.profile.headline || site.profile.title }}</h2>
      <p>{{ site.profile.approach || site.profile.bio }}</p>
    </div>
  </section>
  <section id="jadwal" class="wrap section personal-schedule">
    <div class="section-top">
      <div>
        <p class="section-index">02 / KETERSEDIAAN</p>
        <h2>Waktu untuk cerita Anda.</h2>
        <p>
          Berikut jam kerja rutin saya. Tanggal dan slot yang benar-benar kosong
          tampil pada kalender reservasi.
        </p>
      </div>
      <a href="#reservasi" class="under-link"
        >Lihat kalender <ArrowRight :size="16"
      /></a>
    </div>
    <div class="schedule-preview">
      <div
        v-for="(label, index) in fullWeekdays"
        :key="label"
        :class="{ off: !scheduleFor(index) }"
      >
        <span>{{ label }}</span
        ><strong>{{
          scheduleFor(index)
            ? `${scheduleFor(index).start_time}–${scheduleFor(index).end_time}`
            : "Libur"
        }}</strong>
      </div>
    </div>
  </section>
  <section id="layanan" class="personal-rates">
    <div class="wrap section">
      <div class="section-top">
        <div>
          <p class="section-index">03 / PAKET & HARGA</p>
          <h2>Pilih sesi yang paling cocok.</h2>
          <p>
            Harga dan durasi di bawah adalah milik
            {{ site.profile.name }}, bukan tarif rata-rata studio.
          </p>
        </div>
        <span v-if="availableServices.length"
          >{{ money(minPrice) }} – {{ money(maxPrice) }}</span
        >
      </div>
      <div class="rate-grid">
        <article
          v-for="service in availableServices"
          :key="service.id"
          class="rate-card"
        >
          <div>
            <span class="section-index"
              >{{ service.duration_minutes }} MENIT</span
            >
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
          </div>
          <div class="rate-bottom">
            <strong>{{ money(service.price) }}</strong
            ><button
              type="button"
              class="button primary"
              @click="chooseService(service.id)"
            >
              Pilih sesi <ArrowUpRight :size="16" />
            </button>
          </div>
        </article>
      </div>
      <p v-if="!availableServices.length" class="empty-time">
        Belum ada paket yang tersedia untuk fotografer ini.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ArrowRight, ArrowUpRight, Camera, MapPin } from "lucide-vue-next";
import { usePublicContext } from "../../stores/context";
const {
  site,
  studioHref,
  scheduleFor,
  availableServices,
  minPrice,
  maxPrice,
  chooseService,
  money,
} = usePublicContext();
</script>
