<template>
  <div class="landing-page">
    <Navbar />
    <HeroSection />

    <section class="signal-strip">
      <div class="container signal-grid">
        <div>
          <strong>2 aplikasi</strong><span>untuk rental dan booking</span>
        </div>
        <div><strong>Realtime</strong><span>stok dan slot jadwal</span></div>
        <div>
          <strong>Publik + admin</strong><span>untuk tiap bisnis</span>
        </div>
        <div>
          <strong>Early access</strong><span>pendaftaran gratis</span>
        </div>
      </div>
    </section>

    <section id="produk" class="section products-section">
      <div class="container">
        <div class="section-heading"><p class="eyebrow">Pilih alur yang tepat</p><h2>Dua produk untuk dua cara bisnis melayani pelanggan.</h2><p>Sewa barang dan pesan jasa membutuhkan aturan ketersediaan yang berbeda. RentalKu menyediakan aplikasi khusus untuk masing-masing.</p></div>
        <div class="product-grid">
          <article class="product-card rental-card"><span class="product-index">01 / RENTAL</span><PackageCheck :size="27" /><h3>RentalKu Rental</h3><p>Untuk penyewaan alat outdoor, kamera, perlengkapan acara, dan barang lain. Tampilkan katalog, kelola jumlah stok, lalu pantau order dari masuk hingga selesai.</p><ul><li><Check :size="16" /> Katalog dan detail barang</li><li><Check :size="16" /> Stok serta tarif sewa</li><li><Check :size="16" /> Form dan status order</li></ul><router-link to="/order?product=rental">Pilih Rental <ArrowUpRight :size="16" /></router-link></article>
          <article class="product-card booking-card"><span class="product-index">02 / BOOKING</span><CalendarDays :size="27" /><h3>RentalKu Booking</h3><p>Untuk studio foto dan penyedia jasa yang bekerja berdasarkan waktu. Tampilkan profil studio serta fotografer, buka slot yang tersedia, dan terima reservasi tanpa bentrok.</p><ul><li><Check :size="16" /> Kalender ketersediaan</li><li><Check :size="16" /> Profil studio dan profesional</li><li><Check :size="16" /> Slot terisi otomatis terkunci</li></ul><router-link to="/order?product=booking">Pilih Booking <ArrowUpRight :size="16" /></router-link></article>
        </div>
      </div>
    </section>

    <section id="fitur" class="section features-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Rapi dari hal yang penting</p>
          <h2>Ruang kerja yang memahami apa yang Anda jual.</h2>
          <p>
            Kelola barang ketika pelanggan menyewa alat, atau kelola waktu ketika pelanggan memesan jasa.
          </p>
        </div>
        <div class="feature-grid">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="feature"
          >
            <span class="feature-icon"
              ><component :is="feature.icon" :size="21"
            /></span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <ul>
              <li v-for="detail in feature.details" :key="detail">
                <Check :size="15" />{{ detail }}
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section id="cara-kerja" class="workflow-section">
      <div class="container workflow-grid">
        <div>
          <p class="eyebrow">Cara bergabung</p>
          <h2>Pilih aplikasi, lalu ceritakan bisnis Anda.</h2>
          <p class="workflow-copy">
            Isi formulir singkat untuk Rental atau Booking. Tim kami akan meninjau pendaftaran Anda dan menghubungi Anda untuk langkah berikutnya.
          </p>
          <router-link to="/order" class="btn btn-outline"
            >Daftarkan bisnis <ArrowUpRight :size="17"
          /></router-link>
        </div>
        <ol class="steps">
          <li v-for="(step, index) in steps" :key="step.title">
            <span>{{ String(index + 1).padStart(2, "0") }}</span>
            <div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section id="harga" class="section pricing-section">
      <div class="container pricing-layout">
        <div>
          <p class="eyebrow">Early access RentalKu</p>
          <h2>Daftar tanpa biaya selama early access.</h2>
          <p>
            Pendaftaran untuk kedua aplikasi dibuka gratis selama tahap awal. Pilih produk yang sesuai dengan bisnis Anda.
          </p>
        </div>
        <article class="pricing-card">
          <span class="plan-label">Early access</span>
          <div class="price">
            <strong>Rp0</strong><span>gratis selama tahap awal</span>
          </div>
          <ul>
            <li v-for="item in planItems" :key="item">
              <Check :size="16" />{{ item }}
            </li>
          </ul>
          <router-link to="/order" class="btn btn-primary btn-block"
            >Daftar gratis <ArrowRight :size="17"
          /></router-link>
          <p class="pricing-note">Tidak ada pembayaran saat mendaftar.</p>
        </article>
      </div>
    </section>

    <section id="faq" class="faq-section">
      <div class="container faq-layout">
        <div>
          <p class="eyebrow">Pertanyaan umum</p>
          <h2>Hal yang biasanya ingin diketahui sebelum mulai.</h2>
          <p>
            Masih ada yang ingin dibahas? Kami akan bantu dari proses
            pendaftaran sampai siap digunakan.
          </p>
        </div>
        <div class="faq-list">
          <details v-for="item in faqs" :key="item.question">
            <summary>{{ item.question }}<ChevronDown :size="18" /></summary>
            <p>{{ item.answer }}</p>
          </details>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="container footer-main">
        <router-link to="/" class="footer-brand"
          ><span>R.</span>RentalKu</router-link
        >
        <p>
          Sistem kerja yang lebih rapi untuk bisnis rental dan jasa yang sedang
          bertumbuh.
        </p>
        <div class="footer-links">
          <a href="#produk">Produk</a><a href="#harga">Harga</a
          ><a href="#faq">FAQ</a>
        </div>
      </div>
      <div class="container footer-bottom">
        RentalKu · Aplikasi rental dan booking
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  PackageCheck,
  UsersRound,
  WalletCards,
} from "lucide-vue-next";
import Navbar from "../../components/public/Navbar.vue";
import HeroSection from "../../components/public/HeroSection.vue";

const features = [
  {
    icon: ClipboardList,
    title: "Semua detail pesanan tercatat",
    description:
      "Lihat siapa pelanggan Anda, layanan atau barang yang dipilih, dan status pesanannya tanpa pindah catatan.",
    details: ["Status yang jelas", "Catatan per transaksi"],
  },
  {
    icon: PackageCheck,
    title: "Ketersediaan selalu terlihat",
    description:
      "Stok barang untuk Rental dan slot waktu untuk Booking dikelola sesuai aturan masing-masing produk.",
    details: ["Stok atau slot", "Kategori dan tarif"],
  },
  {
    icon: UsersRound,
    title: "Riwayat pelanggan tersimpan",
    description:
      "Simpan riwayat yang membantu tim melayani pelanggan lama dengan lebih cepat dan konsisten.",
    details: ["Riwayat pesanan", "Data kontak terpusat"],
  },
  {
    icon: WalletCards,
    title: "Ringkasan bisnis mudah dibaca",
    description:
      "Ringkas nilai transaksi dan aktivitas bisnis supaya Anda tidak menunggu rekap manual untuk melihat kondisi usaha.",
    details: ["Ringkasan transaksi", "Aktivitas terbaru"],
  },
];
const steps = [
  {
    title: "Daftarkan bisnis",
    description:
      "Masukkan detail bisnis untuk bergabung pada tahap early access.",
  },
  {
    title: "Tim kami meninjau pendaftaran",
    description:
      "Kami memeriksa kebutuhan bisnis Anda dan menghubungi Anda untuk langkah berikutnya.",
  },
  {
    title: "Siapkan aplikasi bisnis",
    description:
      "Setelah proses penyiapan, mulai masukkan barang atau layanan dan atur operasional bisnis Anda.",
  },
];
const planItems = [
  "Manajemen order dan pelanggan",
  "Katalog barang atau layanan jasa",
  "Ketersediaan stok atau kalender",
  "Ringkasan operasional",
  "Dukungan melalui WhatsApp",
  "Pembaruan fitur berikutnya",
];
const faqs = [
  {
    question: "Apakah ada biaya untuk bergabung sekarang?",
    answer:
      "Belum ada. RentalKu sedang membuka early access gratis untuk aplikasi Rental dan Booking sebelum menentukan model berbayar.",
  },
  {
    question: "Apa beda Rental dan Booking?",
    answer:
      "Rental dirancang untuk barang yang punya jumlah stok dan masa sewa. Booking dirancang untuk layanan berbasis waktu, misalnya sesi fotografi dengan fotografer dan slot kalender.",
  },
  {
    question: "Kapan akses bisnis saya aktif?",
    answer:
      "Tim RentalKu meninjau pendaftaran terlebih dahulu, lalu menghubungi Anda untuk proses penyiapan aplikasi.",
  },
  {
    question: "Apakah data bisnis saya terpisah?",
    answer:
      "Ya. Aplikasi bisnis memakai basis data operasional terpisah dari data pendaftaran platform.",
  },
];
</script>

<style scoped>
.products-section { background: var(--bg-secondary); }
.product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.product-card { display: flex; flex-direction: column; align-items: flex-start; min-height: 390px; padding: 30px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--surface); }
.product-card > svg { margin: 22px 0 16px; color: var(--accent-primary); }
.product-index { color: var(--text-muted); font-size: .72rem; font-weight: 800; letter-spacing: .09em; }
.product-card h3 { font-size: 1.7rem; }.product-card p { max-width: 480px; margin-top: 11px; color: var(--text-secondary); font-size: .92rem; }
.product-card ul { display: grid; gap: 8px; margin: 18px 0 24px; color: var(--text-secondary); font-size: .82rem; }.product-card li { display: flex; align-items: center; gap: 8px; }.product-card li svg { color: var(--accent-primary); }
.product-card a { display: inline-flex; align-items: center; gap: 7px; margin-top: auto; color: var(--accent-primary); font-weight: 800; }.product-card a:hover { text-decoration: underline; }
.booking-card { background: color-mix(in srgb, var(--surface) 88%, var(--accent-soft)); }
.signal-strip {
  border-bottom: 1px solid var(--border-color);
  background: var(--surface);
}
.signal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.signal-grid div {
  display: grid;
  gap: 3px;
  padding: 19px 20px;
  border-left: 1px solid var(--border-color);
}
.signal-grid div:last-child {
  border-right: 1px solid var(--border-color);
}
.signal-grid strong {
  font-family: var(--font-display);
  font-size: 0.95rem;
}
.signal-grid span {
  color: var(--text-secondary);
  font-size: 0.76rem;
}
.section-heading {
  display: grid;
  max-width: 670px;
  gap: 12px;
  margin-bottom: 40px;
}
.eyebrow {
  margin: 0;
  color: var(--accent-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.section-heading h2,
.workflow-grid h2,
.pricing-layout h2,
.faq-layout h2 {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
}
.section-heading > p:last-child,
.workflow-copy,
.pricing-layout > div > p:last-child,
.faq-layout > div > p:last-child {
  color: var(--text-secondary);
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 13px;
}
.feature {
  min-height: 280px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--surface);
}
.feature-icon {
  display: grid;
  width: 41px;
  height: 41px;
  place-items: center;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent-primary);
}
.feature h3 {
  margin-top: 24px;
  font-size: 1rem;
}
.feature > p {
  min-height: 78px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.84rem;
}
.feature ul {
  display: grid;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.feature li,
.pricing-card li {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.76rem;
}
.feature li svg,
.pricing-card li svg {
  color: var(--accent-primary);
}
.workflow-section {
  padding: 80px 0;
  border-block: 1px solid var(--border-color);
  background: var(--surface-subtle);
}
.workflow-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 90px;
  align-items: center;
}
.workflow-grid h2,
.pricing-layout h2,
.faq-layout h2 {
  margin: 10px 0 14px;
}
.workflow-copy {
  max-width: 470px;
  margin-bottom: 24px;
}
.steps {
  display: grid;
  border-top: 1px solid var(--border-color);
}
.steps li {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 16px;
  padding: 21px 0;
  border-bottom: 1px solid var(--border-color);
}
.steps li > span {
  color: var(--coral);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 800;
}
.steps h3 {
  font-size: 0.98rem;
}
.steps p {
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 0.84rem;
}
.pricing-section {
  background: var(--bg-primary);
}
.pricing-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 110px;
  align-items: center;
}
.pricing-layout > div > p:last-child {
  max-width: 480px;
}
.pricing-card {
  padding: 28px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 8px 8px 0 var(--accent-soft);
}
.plan-label {
  color: var(--accent-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.price {
  display: grid;
  gap: 2px;
  margin: 18px 0 23px;
}
.price small {
  color: var(--text-muted);
  text-decoration: line-through;
}
.price strong {
  font-family: var(--font-display);
  font-size: 2.6rem;
}
.price span {
  color: var(--text-secondary);
  font-size: 0.78rem;
}
.pricing-card ul {
  display: grid;
  gap: 10px;
  margin-bottom: 23px;
}
.pricing-note {
  margin-top: 13px;
  color: var(--text-muted);
  font-size: 0.74rem;
  text-align: center;
}
.faq-section {
  padding: 80px 0;
  border-top: 1px solid var(--border-color);
}
.faq-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 110px;
}
.faq-list {
  border-top: 1px solid var(--border-color);
}
.faq-list details {
  border-bottom: 1px solid var(--border-color);
}
.faq-list summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 17px 0;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  list-style: none;
}
.faq-list summary::-webkit-details-marker {
  display: none;
}
.faq-list summary svg {
  flex: 0 0 auto;
  transition: transform 0.15s;
}
.faq-list details[open] summary svg {
  transform: rotate(180deg);
}
.faq-list details p {
  max-width: 620px;
  padding: 0 0 18px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.site-footer {
  padding-top: 42px;
  background: var(--admin-sidebar);
  color: var(--text-primary);
}
.footer-main {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  gap: 35px;
  padding-bottom: 36px;
}
.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-display);
  font-weight: 800;
}
.footer-brand span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 5px;
  background: #70d1c0;
  color: #15332d;
}
.footer-main p {
  max-width: 290px;
  color: var(--text-secondary);
  font-size: 0.82rem;
}
.footer-links {
  display: grid;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
}
.footer-links a:hover {
  color: var(--accent-primary);
}
.footer-bottom {
  padding: 15px 0;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.72rem;
}
@media (max-width: 900px) {
  .product-grid { grid-template-columns: 1fr; }
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .workflow-grid,
  .faq-layout {
    grid-template-columns: 1fr;
    gap: 42px;
  }
  .pricing-layout {
    grid-template-columns: 1fr;
    gap: 35px;
  }
  .pricing-card {
    width: min(420px, 100%);
  }
  .footer-main {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 620px) {
  .product-card { min-height: auto; padding: 24px; }
  .signal-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .signal-grid div:nth-child(3) {
    border-left: 0;
  }
  .signal-grid div:nth-child(2) {
    border-right: 1px solid var(--border-color);
  }
  .feature-grid {
    grid-template-columns: 1fr;
  }
  .feature {
    min-height: auto;
  }
  .feature > p {
    min-height: 0;
  }
  .workflow-section,
  .faq-section {
    padding: 60px 0;
  }
  .footer-main {
    grid-template-columns: 1fr;
  }
}
</style>
