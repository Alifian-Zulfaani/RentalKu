<template>
  <section id="tentang" class="section about-section">
    <div class="container about-grid">
      <div class="about-media">
        <img
          src="/images/rentalku-gear-care.jpg"
          alt="Perlengkapan outdoor yang diperiksa dan dirawat sebelum disewakan"
          loading="lazy"
        />
        <div class="care-stamp">
          <ShieldCheck :size="22" />
          <span
            ><strong>Trip-ready</strong
            ><small>Diperiksa sebelum berangkat</small></span
          >
        </div>
      </div>

      <div class="about-content">
        <p class="section-kicker">Gear yang bisa dipercaya</p>
        <h2>Perjalanan lebih tenang dimulai dari alat yang terawat.</h2>
        <p class="about-text">
          {{
            config.about_text ||
            "Kami menyiapkan perlengkapan hiking dan camping yang bersih, layak pakai, dan sesuai kebutuhan perjalananmu."
          }}
        </p>
        <div class="features">
          <div class="feature-item">
            <CheckCircle /><span
              ><strong>Dicek satu per satu</strong
              ><small
                >Kondisi gear diverifikasi sebelum diserahkan.</small
              ></span
            >
          </div>
          <div class="feature-item">
            <Tag /><span
              ><strong>Tarif tanpa kejutan</strong
              ><small>Harga dan durasi terlihat sejak awal.</small></span
            >
          </div>
          <div class="feature-item">
            <MessagesSquare /><span
              ><strong>Ada manusia yang membantu</strong
              ><small
                >Konsultasikan kebutuhan trip melalui WhatsApp.</small
              ></span
            >
          </div>
        </div>
        <div class="contact-line">
          <span v-if="config.address"
            ><MapPin :size="16" /> {{ config.address }}</span
          >
          <a
            v-if="config.whatsapp"
            :href="
              toWhatsAppUrl(
                config.whatsapp,
                `Halo ${config.business_name}, saya ingin rekomendasi perlengkapan untuk trip saya.`,
              )
            "
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            Tanya kebutuhan gear <ArrowUpRight :size="16" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  ArrowUpRight,
  CheckCircle,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Tag,
} from "lucide-vue-next";
import { toWhatsAppUrl } from "../../utils/formatters";
defineProps({ config: { type: Object, required: true } });
</script>

<style scoped>
.about-section {
  background: var(--surface);
}
.about-grid {
  display: grid;
  grid-template-columns: minmax(390px, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(44px, 7vw, 92px);
}
.about-media {
  position: relative;
  min-height: 560px;
}
.about-media > img {
  width: 100%;
  height: 560px;
  object-fit: cover;
  border-radius: 24px 4px 24px 4px;
  box-shadow: var(--shadow-lg);
}
.about-media::after {
  position: absolute;
  right: -18px;
  bottom: -18px;
  z-index: -1;
  width: 72%;
  height: 66%;
  border-radius: 4px 4px 26px 4px;
  background: var(--brand-sand);
  content: "";
  opacity: 0.38;
}
.care-stamp {
  position: absolute;
  right: 20px;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 17px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 13px;
  background: rgba(24, 49, 39, 0.86);
  color: #fff;
  backdrop-filter: blur(10px);
}
.care-stamp svg {
  color: #e4b06f;
}
.care-stamp span {
  display: grid;
  line-height: 1.2;
}
.care-stamp strong {
  font-size: 0.88rem;
}
.care-stamp small {
  margin-top: 4px;
  color: #cbd7d0;
  font-size: 0.72rem;
}
.section-kicker {
  margin-bottom: 10px;
  color: var(--brand-secondary);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.about-content h2 {
  max-width: 670px;
  font-size: clamp(2rem, 4vw, 3.05rem);
  letter-spacing: -0.042em;
  text-wrap: balance;
}
.about-text {
  margin-top: 20px;
  color: var(--text-secondary);
  font-size: 1.02rem;
  line-height: 1.78;
  white-space: pre-line;
}
.features {
  display: grid;
  gap: 4px;
  margin-top: 26px;
}
.feature-item {
  display: grid;
  grid-template-columns: 38px 1fr;
  align-items: start;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
}
.feature-item svg {
  margin-top: 2px;
  color: var(--brand-primary);
}
.feature-item span {
  display: grid;
}
.feature-item strong {
  font-size: 0.91rem;
}
.feature-item small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}
.contact-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 27px;
}
.contact-line > span {
  display: inline-flex;
  max-width: 290px;
  align-items: flex-start;
  gap: 6px;
  color: var(--text-muted);
  font-size: 0.74rem;
}
.contact-line > span svg {
  flex: 0 0 auto;
}
@media (max-width: 920px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .about-media {
    width: min(680px, 100%);
    min-height: auto;
  }
  .about-media > img {
    height: clamp(390px, 68vw, 540px);
  }
  .about-content {
    max-width: 720px;
  }
}
@media (max-width: 560px) {
  .about-media > img {
    height: 380px;
  }
  .contact-line {
    align-items: stretch;
    flex-direction: column;
  }
  .contact-line .btn {
    width: 100%;
  }
  .about-media::after {
    right: -10px;
    bottom: -10px;
  }
}
</style>
