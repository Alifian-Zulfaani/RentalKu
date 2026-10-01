<template>
  <section class="hero wrap">
    <div class="hero-copy">
      <div class="eyebrow">
        <span></span>STUDIO FOTOGRAFI /
        {{ site.tenant.location.toUpperCase() }}
      </div>
      <h1>{{ site.tenant.tagline }}</h1>
      <p class="hero-intro">
        {{ site.tenant.about }}
      </p>
      <div class="hero-actions">
        <a href="#reservasi" class="button primary"
          >Lihat jadwal tersedia <ArrowRight :size="17" /></a
        ><a href="#fotografer" class="under-link">Kenali fotografer kami</a>
      </div>
      <div class="hero-meta">
        <span><MapPin :size="16" /> {{ site.tenant.location }}</span
        ><span><CalendarDays :size="16" /> Reservasi sesuai jadwal</span>
      </div>
    </div>
    <div class="hero-art">
      <div class="photo-frame">
        <img
          :src="site.tenant.hero_image_url || '/images/studio-senja-hero.png'"
          alt="Sesi potret di studio fotografi dengan cahaya sore"
          fetchpriority="high"
        /><span>GOOD LIGHT / GOOD STORIES</span>
      </div>
      <div class="art-caption">
        <span>01 / 03</span><span>Ruang untuk cerita Anda</span>
      </div>
    </div>
  </section>

  <section id="tentang" class="about-band">
    <div class="wrap about-grid">
      <p class="section-index">01 — TENTANG KAMI</p>
      <div>
        <h2>Setiap cerita pantas mendapat ruang dan waktu.</h2>
        <p>{{ site.tenant.about }}</p>
      </div>
      <div class="about-side">
        <Camera :size="28" /><span
          >Potret yang terasa dekat, dibuat dengan perhatian pada setiap
          detail.</span
        >
      </div>
    </div>
  </section>

  <section id="fotografer" class="wrap section photographers">
    <div class="section-top">
      <div>
        <p class="section-index">02 — ORANG DI BALIK KAMERA</p>
        <h2>Pilih sudut pandang yang paling dekat dengan Anda.</h2>
      </div>
      <span>{{ site.professionals.length }} fotografer</span>
    </div>
    <div class="people-grid">
      <a
        v-for="(person, index) in site.professionals"
        :key="person.id"
        :href="profileHref(person.slug)"
        class="person-card"
        ><div class="person-art" :class="`portrait-${index % 2}`">
          <img
            v-if="person.photo_url"
            :src="person.photo_url"
            :alt="`Potret ${person.name}`"
            loading="lazy"
          />
          <span v-else>{{
            person.name
              .split(" ")
              .map((part) => part[0])
              .join("")
          }}</span>
        </div>
        <div class="person-details">
          <div>
            <h3>{{ person.name }}</h3>
            <p>{{ person.title }}</p>
            <small v-if="person.price_from != null"
              >Mulai {{ money(person.price_from) }}</small
            >
          </div>
          <ArrowUpRight :size="21" /></div
      ></a>
    </div>
  </section>

  <section id="layanan" class="services-section">
    <div class="wrap section">
      <div class="section-top">
        <div>
          <p class="section-index">03 — LAYANAN</p>
          <h2>Mulai dari momen yang ingin Anda simpan.</h2>
        </div>
      </div>
      <div class="service-list">
        <article
          v-for="(service, index) in studioServices"
          :key="service.id"
          class="service-row"
        >
          <span class="row-number">{{
            String(index + 1).padStart(2, "0")
          }}</span>
          <div>
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
          </div>
          <div class="service-meta">
            <span>{{ service.duration_minutes }} menit</span
            ><strong>Mulai {{ money(service.price_from) }}</strong>
          </div>
          <button
            type="button"
            class="circle-link"
            :aria-label="`Pilih ${service.name}`"
            @click="chooseService(service.id)"
          >
            <ArrowUpRight :size="19" />
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  MapPin,
} from "lucide-vue-next";
import { usePublicContext } from "../../stores/context";
const { site, profileHref, studioServices, chooseService, money } =
  usePublicContext();
</script>
