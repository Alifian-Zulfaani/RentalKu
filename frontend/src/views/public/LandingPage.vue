<template>
  <div class="landing-page">
    <Navbar />
    <HeroSection />

    <section class="signal-strip">
      <div class="container signal-grid">
        <div>
          <strong>1 ruang kerja</strong><span>untuk seluruh operasional</span>
        </div>
        <div><strong>Realtime</strong><span>stok dan status order</span></div>
        <div>
          <strong>Lifetime</strong><span>sekali bayar, seterusnya pakai</span>
        </div>
        <div>
          <strong>Manusiawi</strong><span>dibuat untuk kerja harian</span>
        </div>
      </div>
    </section>

    <section id="fitur" class="section features-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Rapi dari hal yang penting</p>
          <h2>Operasional rental, tanpa keruwetan tambahan.</h2>
          <p>
            Setiap layar dibuat untuk membantu Anda tahu apa yang perlu
            dikerjakan sekarang, bukan sekadar menampilkan lebih banyak angka.
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
          <p class="eyebrow">Mulai tanpa drama</p>
          <h2>Satu alur sederhana, untuk hari kerja yang lebih tenang.</h2>
          <p class="workflow-copy">
            RentalKu disusun mengikuti cara pemilik rental bekerja: data masuk,
            order bergerak, barang kembali, dan keputusan jadi lebih jelas.
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
          <h2>Mulai gratis, sambil kami tumbuh bersama pasar.</h2>
          <p>
            Akses awal dibuka tanpa biaya agar kami bisa belajar dari alur kerja
            bisnis rental yang nyata sebelum menentukan model berbayar.
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
          ><span><Boxes :size="18" /></span>RentalKu</router-link
        >
        <p>
          Sistem kerja yang lebih rapi untuk bisnis rental yang sedang
          bertumbuh.
        </p>
        <div class="footer-links">
          <a href="#fitur">Produk</a><a href="#harga">Harga</a
          ><router-link to="/admin/login">Admin</router-link>
        </div>
      </div>
      <div class="container footer-bottom">
        RentalKu · Platform manajemen rental
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
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
    title: "Order yang punya konteks",
    description:
      "Lihat siapa menyewa, barang apa yang keluar, dan tahap order saat ini tanpa pindah-pindah catatan.",
    details: ["Status rental yang jelas", "Catatan per transaksi"],
  },
  {
    icon: PackageCheck,
    title: "Inventaris yang bisa dipercaya",
    description:
      "Pantau barang yang siap sewa dan yang sedang berada di tangan pelanggan dengan satu sumber data.",
    details: ["Ketersediaan stok", "Kategori dan tarif"],
  },
  {
    icon: UsersRound,
    title: "Pelanggan tidak lagi anonim",
    description:
      "Simpan riwayat yang membantu tim melayani pelanggan lama dengan lebih cepat dan konsisten.",
    details: ["Riwayat penyewaan", "Data kontak terpusat"],
  },
  {
    icon: WalletCards,
    title: "Angka yang tidak terlambat",
    description:
      "Ringkas nilai transaksi dan aktivitas bisnis supaya Anda tidak menunggu rekap manual untuk melihat kondisi usaha.",
    details: ["Ringkasan pendapatan", "Status pembayaran"],
  },
];
const steps = [
  {
    title: "Daftarkan bisnis",
    description:
      "Masukkan detail bisnis untuk bergabung pada tahap early access.",
  },
  {
    title: "Kami review pendaftaran",
    description:
      "Tim platform mengonfirmasi pendaftaran agar proses onboarding tetap rapi.",
  },
  {
    title: "Mulai atur operasional",
    description:
      "Akses workspace dan susun proses rental dengan data yang lebih terstruktur.",
  },
];
const planItems = [
  "Manajemen order dan pelanggan",
  "Inventaris dan ketersediaan barang",
  "Halaman booking bisnis",
  "Laporan operasional",
  "Dukungan melalui WhatsApp",
  "Pembaruan fitur berikutnya",
];
const faqs = [
  {
    question: "Apakah ada biaya untuk bergabung sekarang?",
    answer:
      "Belum ada. RentalKu sedang membuka early access gratis untuk memahami kebutuhan pasar rental sebelum menentukan model berbayar.",
  },
  {
    question: "Apakah bisa dipakai untuk berbagai jenis rental?",
    answer:
      "Bisa. Alur RentalKu dirancang untuk kebutuhan rental secara umum, mulai dari alat outdoor sampai perlengkapan acara atau kendaraan.",
  },
  {
    question: "Kapan akses bisnis saya aktif?",
    answer:
      "Pendaftaran masuk terlebih dahulu untuk direview admin platform. Setelah dikonfirmasi, proses onboarding dapat dimulai.",
  },
  {
    question: "Apakah data bisnis saya terpisah?",
    answer:
      "Ya. Setiap bisnis rental memiliki ruang data operasionalnya sendiri agar data pelanggan dan inventaris tetap terisolasi.",
  },
];
</script>

<style scoped>
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
  color: #e7efeb;
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
  color: #abbab2;
  font-size: 0.82rem;
}
.footer-links {
  display: grid;
  gap: 8px;
  color: #cbd8d1;
  font-size: 0.82rem;
  font-weight: 700;
}
.footer-links a:hover {
  color: #70d1c0;
}
.footer-bottom {
  padding: 15px 0;
  border-top: 1px solid #34433b;
  color: #91a59b;
  font-size: 0.72rem;
}
@media (max-width: 900px) {
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
