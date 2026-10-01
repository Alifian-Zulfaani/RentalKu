<template>
  <div class="site-shell success-page">
    <header class="site-header">
      <div class="wrap header-inner">
        <a :href="returnHref" class="wordmark">
          <span class="mark">S.</span>
          <span>{{ tenantName }}<small>PHOTOGRAPHY HOUSE</small></span>
        </a>
        <div class="success-header-actions">
          <ThemeToggle />
          <a :href="returnHref" class="button secondary success-header-link">
            Kembali ke situs
          </a>
        </div>
      </div>
    </header>
    <main class="success-main wrap">
      <template v-if="receipt">
        <div class="success-intro">
          <span class="confirmation-icon"><CalendarCheck2 :size="29" /></span>
          <p class="section-index">RESERVASI TERKIRIM</p>
          <h1>Terima kasih, {{ receipt.customer_name }}.</h1>
          <p>
            Permintaan sesi Anda sudah tercatat. Tim {{ tenantName }} akan
            menghubungi Anda melalui WhatsApp untuk mengonfirmasi jadwal dan
            menjelaskan langkah berikutnya.
          </p>
        </div>
        <section class="booking-confirmation" aria-labelledby="receipt-title">
          <div class="receipt-heading">
            <div>
              <p class="confirmation-kicker">MENUNGGU KONFIRMASI STUDIO</p>
              <h2 id="receipt-title">Ringkasan reservasi</h2>
            </div>
            <strong>#{{ receipt.id }}</strong>
          </div>
          <dl class="confirmation-details">
            <div>
              <dt>Layanan</dt>
              <dd>{{ receipt.service_name }}</dd>
            </div>
            <div>
              <dt>Fotografer</dt>
              <dd>{{ receipt.professional_name }}</dd>
            </div>
            <div>
              <dt>Jadwal</dt>
              <dd>
                {{ longDate(receipt.date) }} · {{ receipt.start_time }}–{{
                  receipt.end_time
                }}
              </dd>
            </div>
            <div>
              <dt>Estimasi biaya</dt>
              <dd>{{ money(receipt.total) }}</dd>
            </div>
          </dl>
          <p class="receipt-note">
            Simpan nomor reservasi ini jika ingin bertanya kepada studio.
          </p>
        </section>
        <div class="confirmation-actions success-actions">
          <a
            v-if="whatsappUrl"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="button primary"
          >
            Tanya lewat WhatsApp <ArrowUpRight :size="17" />
          </a>
          <a :href="returnHref + '#reservasi'" class="button secondary"
            >Buat reservasi lain</a
          >
        </div>
      </template>
      <div v-else class="success-intro missing-receipt">
        <span class="confirmation-icon"><CalendarDays :size="29" /></span>
        <h1>Ringkasan tidak tersedia.</h1>
        <p>
          Halaman ini hanya menampilkan detail setelah reservasi berhasil
          dikirim. Silakan kembali ke situs untuk melihat jadwal.
        </p>
        <a :href="returnHref" class="button primary">Kembali ke situs</a>
      </div>
    </main>
    <FloatingActions
      :phone="receipt?.tenant_whatsapp"
      :business-name="tenantName"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ArrowUpRight, CalendarCheck2, CalendarDays } from "lucide-vue-next";
import { siteContext } from "../../services/api";
import { longDate, money } from "../../utils/formatters";
import FloatingActions from "../../components/shared/FloatingActions.vue";
import ThemeToggle from "../../components/shared/ThemeToggle.vue";

const context = siteContext();
const receipt = window.history.state?.confirmation || null;
const tenantName = receipt?.tenant_name || "Studio";
const localHost =
  ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
  window.location.hostname.endsWith(".localhost");
const returnHref = localHost
  ? `/?tenant=${encodeURIComponent(context.tenant || "studio")}${context.pro ? `&pro=${encodeURIComponent(context.pro)}` : ""}`
  : "/";
const whatsappUrl = computed(() => {
  const number = String(receipt?.tenant_whatsapp || "")
    .replace(/\D/g, "")
    .replace(/^0/, "62");
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(`Halo ${tenantName}, saya ingin menanyakan reservasi #${receipt.id}.`)}`;
});
document.title = receipt
  ? `Reservasi #${receipt.id} terkirim | ${tenantName}`
  : `Reservasi | ${tenantName}`;
</script>
