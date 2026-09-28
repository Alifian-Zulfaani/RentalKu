<template>
  <section class="hero">
    <div class="topo-lines" aria-hidden="true"></div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">
          <Compass :size="15" />
          {{ config.tagline || "Peralatan siap untuk petualangan" }}
        </p>
        <h1>
          {{
            config.hero_title ||
            "Lebih ringan berangkat. Lebih jauh menjelajah."
          }}
        </h1>
        <p class="hero-description">
          {{
            config.hero_subtitle ||
            "Sewa perlengkapan hiking dan camping yang terawat. Pilih alat, tentukan tanggal, lalu tim kami menyiapkannya untuk perjalananmu."
          }}
        </p>
        <div class="hero-actions">
          <router-link to="/sewa" class="btn btn-primary btn-lg"
            >Mulai pilih perlengkapan <ArrowRight :size="18"
          /></router-link>
          <a href="#katalog" class="text-action"
            >Lihat katalog <ArrowDown :size="16"
          /></a>
        </div>
        <div class="hero-notes" aria-label="Keunggulan layanan">
          <span><Check :size="16" /> Stok aktual</span>
          <span><Check :size="16" /> Tarif transparan</span>
          <span><Check :size="16" /> Gear diperiksa</span>
        </div>
      </div>

      <div class="hero-media">
        <img
          src="/images/rentalku-outdoor-hero.jpg"
          alt="Perlengkapan camping di kawasan pegunungan saat matahari terbit"
          fetchpriority="high"
        />
        <div class="media-shade" aria-hidden="true"></div>
        <div class="location-stamp">
          <MapPin :size="15" /> Siap untuk jalur berikutnya
        </div>
        <div class="availability-panel">
          <div class="panel-heading">
            <span><i></i> Katalog tersedia</span>
            <a href="#katalog" aria-label="Lihat katalog"
              ><ArrowUpRight :size="17"
            /></a>
          </div>
          <div class="catalog-metrics">
            <div>
              <strong>{{ products.length }}</strong
              ><span>Jenis gear</span>
            </div>
            <div>
              <strong>{{ availableUnits }}</strong
              ><span>Unit siap</span>
            </div>
            <div>
              <strong>{{ categories.length }}</strong
              ><span>Kategori</span>
            </div>
          </div>
          <p v-if="featuredProduct">
            <TentTree :size="16" /> {{ featuredProduct.name }}
            <b>{{ featuredProduct.available_stock }} unit</b>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  MapPin,
  TentTree,
} from "lucide-vue-next";

const props = defineProps({
  config: { type: Object, required: true },
  products: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
});

const featuredProduct = computed(() =>
  props.products.find((item) => item.available_stock > 0),
);
const availableUnits = computed(() =>
  props.products.reduce(
    (total, item) => total + Number(item.available_stock || 0),
    0,
  ),
);
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 68px 0 82px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
}
.topo-lines {
  position: absolute;
  inset: 0 auto 0 0;
  width: 48%;
  opacity: 0.36;
  background-image: url("data:image/svg+xml,%3Csvg width='220' height='220' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%236f8259' stroke-opacity='.18'%3E%3Cpath d='M-30 120C20 40 65 190 135 95s115 35 95 95'/%3E%3Cpath d='M-25 142C28 62 70 205 146 116s102 23 100 86'/%3E%3Cpath d='M-18 165C40 86 84 215 155 139s90 11 93 74'/%3E%3Cpath d='M10 92C44 34 87 144 139 67s97 11 92 69'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 220px;
  pointer-events: none;
}
.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(500px, 1.12fr);
  align-items: center;
  gap: 58px;
}
.hero-copy {
  position: relative;
  z-index: 2;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: var(--brand-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.eyebrow svg {
  color: var(--brand-secondary);
}
.hero h1 {
  max-width: 670px;
  margin-bottom: 22px;
  font-size: clamp(2.85rem, 5.3vw, 5rem);
  letter-spacing: -0.058em;
  text-wrap: balance;
}
.hero-description {
  max-width: 580px;
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.72;
}
.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
}
.text-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.9rem;
  font-weight: 750;
}
.text-action:hover {
  color: var(--brand-primary);
}
.hero-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 17px;
  margin-top: 30px;
  color: var(--text-secondary);
  font-size: 0.79rem;
}
.hero-notes span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.hero-notes svg {
  color: var(--brand-moss);
}
.hero-media {
  position: relative;
  min-height: 600px;
  overflow: hidden;
  border-radius: 4px 28px 4px 28px;
  background: var(--surface-subtle);
  box-shadow:
    20px 22px 0 color-mix(in srgb, var(--brand-sand) 28%, transparent),
    var(--shadow-lg);
}
.hero-media > img {
  width: 100%;
  height: 100%;
  min-height: 600px;
  object-fit: cover;
  object-position: 56% center;
}
.media-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(10, 26, 20, 0.62));
}
.location-stamp {
  position: absolute;
  top: 22px;
  left: 22px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: var(--radius-full);
  background: rgba(18, 42, 33, 0.58);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 750;
  backdrop-filter: blur(8px);
}
.availability-panel {
  position: absolute;
  right: 22px;
  bottom: 22px;
  left: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 14px;
  background: rgba(248, 246, 238, 0.92);
  color: #1c2b24;
  box-shadow: 0 18px 40px rgba(7, 20, 15, 0.23);
  backdrop-filter: blur(12px);
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 15px 10px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.panel-heading span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.panel-heading i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3a805c;
  box-shadow: 0 0 0 4px rgba(58, 128, 92, 0.14);
}
.panel-heading a {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #234638;
  color: #fff;
}
.catalog-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid rgba(35, 70, 56, 0.12);
  border-bottom: 1px solid rgba(35, 70, 56, 0.12);
}
.catalog-metrics div {
  padding: 13px 15px;
  border-right: 1px solid rgba(35, 70, 56, 0.12);
}
.catalog-metrics div:last-child {
  border-right: 0;
}
.catalog-metrics strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.32rem;
}
.catalog-metrics span {
  color: #66736c;
  font-size: 0.68rem;
}
.availability-panel > p {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 15px;
  color: #526057;
  font-size: 0.72rem;
}
.availability-panel > p b {
  margin-left: auto;
  color: #347052;
}
@media (max-width: 1020px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .hero-copy {
    max-width: 760px;
  }
  .hero-media {
    width: min(760px, calc(100% - 18px));
    min-height: 520px;
    justify-self: center;
  }
  .hero-media > img {
    min-height: 520px;
  }
}
@media (max-width: 560px) {
  .hero {
    padding: 48px 0 62px;
  }
  .hero h1 {
    font-size: clamp(2.45rem, 12vw, 3.5rem);
  }
  .hero-media {
    min-height: 430px;
    border-radius: 3px 20px 3px 20px;
  }
  .hero-media > img {
    min-height: 430px;
    object-position: 62% center;
  }
  .location-stamp {
    top: 14px;
    left: 14px;
  }
  .availability-panel {
    right: 14px;
    bottom: 14px;
    left: 14px;
  }
  .catalog-metrics div {
    padding: 11px 9px;
  }
  .hero-notes {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
