<template>
  <section id="faq" class="section">
    <div class="container">
      <h2 class="section-title">
        Pertanyaan <span class="text-gradient">Umum</span>
      </h2>
      <p class="section-subtitle">
        Jawaban untuk pertanyaan yang sering ditanyakan
      </p>
      <div class="faq-list">
        <div
          class="faq-item glass-card"
          v-for="(q, i) in faqs"
          :key="i"
          :class="{ active: openIndex === i }"
          @click="toggle(i)"
        >
          <div class="faq-question">
            <span>{{ q.question }}</span>
            <svg
              :class="{ rotated: openIndex === i }"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div class="faq-answer" v-show="openIndex === i">
            <p>{{ q.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
const openIndex = ref(0);
const toggle = (i) => {
  openIndex.value = openIndex.value === i ? -1 : i;
};

const faqs = [
  {
    question: "Apakah benar bayar sekali saja?",
    answer:
      "Ya! Dengan paket Lifetime Deal, kamu cukup bayar Rp249.000 satu kali saja dan bisa menggunakan RentalKu selamanya. Tidak ada biaya bulanan atau tahunan.",
  },
  {
    question: "Bisnis rental apa saja yang bisa pakai RentalKu?",
    answer:
      "RentalKu cocok untuk semua jenis bisnis rental: tenda & dekorasi, kamera & videografi, sound system, kendaraan, pakaian adat, peralatan outdoor, dan masih banyak lagi.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Tentu! Data kamu disimpan dengan enkripsi dan backup otomatis setiap hari. Kami menggunakan server yang aman dan terpercaya.",
  },
  {
    question: "Bisa diakses dari HP?",
    answer:
      "Ya, RentalKu sudah responsive dan bisa diakses dari HP, tablet, maupun laptop/PC. Bahkan bisa di-install sebagai aplikasi (PWA) di HP kamu.",
  },
  {
    question: "Bagaimana cara mendaftar?",
    answer:
      'Klik tombol "Mulai Sekarang", isi data diri, pilih metode pembayaran, dan lakukan pembayaran. Akun kamu akan langsung aktif setelah pembayaran dikonfirmasi.',
  },
  {
    question: "Ada dukungan teknis?",
    answer:
      "Ya, kami menyediakan dukungan teknis via WhatsApp. Tim kami siap membantu kamu dalam setup dan penggunaan RentalKu.",
  },
];
</script>

<style scoped>
.faq-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  padding: 0;
  cursor: pointer;
  overflow: hidden;
}
.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}
.faq-question svg {
  transition: transform 0.3s;
  color: var(--text-muted);
  flex-shrink: 0;
}
.faq-question svg.rotated {
  transform: rotate(180deg);
}
.faq-answer {
  padding: 0 24px 20px;
}
.faq-answer p {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.95rem;
}
.faq-item.active {
  border-color: var(--border-accent);
}
</style>
