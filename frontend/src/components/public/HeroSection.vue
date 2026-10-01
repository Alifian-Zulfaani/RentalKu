<template>
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> Dua aplikasi, satu ekosistem bisnis</p>
        <h1>Bisnis bergerak lebih rapi bersama <span class="text-gradient">RentalKu.</span></h1>
        <p class="hero-lead">Kelola penyewaan barang atau reservasi jasa sesuai cara bisnis Anda bekerja.</p>
        <p class="hero-description">RentalKu Rental menghubungkan katalog, stok, dan order. RentalKu Booking mengatur profil penyedia jasa, jadwal, dan slot yang tersedia. Pelanggan mendapat pengalaman yang jelas sejak memilih hingga memesan.</p>
        <div class="hero-actions">
          <router-link to="/order" class="btn btn-primary btn-lg">Daftarkan bisnis <ArrowRight :size="18" /></router-link>
          <a href="#produk" class="text-action">Jelajahi dua aplikasi <ArrowDown :size="16" /></a>
        </div>
        <div class="hero-notes">
          <span><Check :size="16" /> Pilih sesuai usaha</span>
          <span><Check :size="16" /> Early access gratis</span>
          <span><Check :size="16" /> Tampilan ramah pelanggan</span>
        </div>
      </div>

      <div class="product-shot" aria-label="Contoh dashboard rental">
        <div class="shot-bar"><span class="shot-brand"><Boxes :size="16" /> Summit Gear</span><span class="shot-user">AK</span></div>
        <div class="shot-content">
          <aside><span class="active">Ringkasan</span><span>Order</span><span>Inventaris</span><span>Pelanggan</span></aside>
          <div class="shot-main">
            <div class="shot-heading"><div><small>Selamat pagi, Anisa</small><strong>Operasional hari ini</strong></div><button>+ Order baru</button></div>
            <div class="metric-grid">
              <div><small>Order aktif</small><strong>18</strong><em>+4 minggu ini</em></div>
              <div><small>Barang tersedia</small><strong>126</strong><em>92% siap sewa</em></div>
              <div><small>Pendapatan</small><strong>Rp8,4jt</strong><em>bulan berjalan</em></div>
            </div>
            <div class="orders"><div class="orders-title"><strong>Pengambilan hari ini</strong><span>5 order</span></div><div v-for="order in orders" :key="order.name" class="order-row"><span class="order-avatar">{{ order.initial }}</span><span><strong>{{ order.name }}</strong><small>{{ order.item }}</small></span><b>{{ order.time }}</b></div></div>
          </div>
        </div>
      </div>
      <div class="booking-preview"><span>02 / RENTALKU BOOKING</span><strong>Studio Senja</strong><small>Kalender reservasi jasa fotografi</small><div><b>Sen</b><b>Sel</b><b>Rab</b><b>Kam</b><b>Jum</b><b>Sab</b><b>Min</b><em>12</em><em>13</em><em class="taken">14</em><em>15</em><em>16</em><em class="selected">17</em><em>18</em></div><p>17 Oktober · 10.00 tersedia</p></div>
    </div>
  </section>
</template>

<script setup>
import { ArrowDown, ArrowRight, Boxes, Check } from "lucide-vue-next";

const orders = [
  { initial: "R", name: "Rafi Pratama", item: "Paket Camping 4 Orang", time: "09.00" },
  { initial: "D", name: "Dina Kurnia", item: "Tenda Family Pro", time: "11.30" },
  { initial: "A", name: "Arga Putra", item: "Carrier & Cooking Set", time: "15.00" },
];
</script>

<style scoped>
.hero { padding: 74px 0 56px; border-bottom: 1px solid var(--border-color); background: var(--bg-primary); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 0.88fr) minmax(500px, 1.12fr); align-items: center; gap: 58px; position: relative; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; color: var(--text-secondary); font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: var(--coral); }
.hero h1 { margin-bottom: 16px; font-size: clamp(2.8rem, 5vw, 4.65rem); letter-spacing: -0.055em; }
.hero-lead { max-width: 580px; margin-bottom: 14px; font-family: var(--font-display); font-size: clamp(1.35rem, 2vw, 1.8rem); font-weight: 700; line-height: 1.32; }
.hero-description { max-width: 540px; color: var(--text-secondary); font-size: 1rem; }
.hero-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 20px; margin-top: 29px; }
.text-action { display: inline-flex; align-items: center; gap: 7px; color: var(--text-primary); font-weight: 700; font-size: 0.9rem; }
.text-action:hover { color: var(--accent-primary); }
.hero-notes { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 30px; color: var(--text-secondary); font-size: 0.8rem; }
.hero-notes span { display: inline-flex; align-items: center; gap: 5px; }.hero-notes svg { color: var(--accent-primary); }
.product-shot { overflow: hidden; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface-raised); box-shadow: 12px 16px 0 var(--accent-soft), var(--shadow-lg); }
.booking-preview { position: absolute; right: -10px; bottom: -25px; display: grid; gap: 4px; width: 235px; padding: 17px; border: 1px solid var(--border-strong); border-radius: 9px; background: var(--surface-raised); box-shadow: var(--shadow-lg); }
.booking-preview > span { color: var(--accent-primary); font-size: .65rem; font-weight: 800; letter-spacing: .08em; }.booking-preview strong { font-size: 1.05rem; }.booking-preview small { color: var(--text-secondary); font-size: .7rem; }.booking-preview > div { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-top: 8px; text-align: center; }.booking-preview b, .booking-preview em { padding: 6px 1px; font-size: .57rem; font-style: normal; }.booking-preview b { color: var(--text-muted); }.booking-preview .taken { color: var(--text-muted); text-decoration: line-through; }.booking-preview .selected { border-radius: 4px; background: var(--accent-primary); color: var(--accent-contrast); }.booking-preview p { color: var(--accent-primary); font-size: .68rem; font-weight: 700; }
.shot-bar { display: flex; align-items: center; justify-content: space-between; min-height: 48px; padding: 0 16px; border-bottom: 1px solid var(--border-color); font-size: 0.78rem; }.shot-brand { display: inline-flex; align-items: center; gap: 7px; font-weight: 800; }.shot-brand svg { color: var(--accent-primary); }.shot-user { display: grid; width: 24px; height: 24px; place-items: center; border-radius: 50%; background: #f2ddc6; color: #754b24; font-weight: 800; font-size: 0.67rem; }
.shot-content { display: grid; grid-template-columns: 116px 1fr; min-height: 347px; }.shot-content aside { display: flex; flex-direction: column; gap: 5px; padding: 16px 9px; border-right: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.68rem; font-weight: 700; }.shot-content aside span { padding: 7px 8px; border-radius: 4px; }.shot-content aside .active { background: var(--accent-soft); color: var(--accent-primary); }
.shot-main { padding: 20px; }.shot-heading { display: flex; justify-content: space-between; gap: 12px; }.shot-heading small, .metric-grid small, .order-row small { display: block; color: var(--text-muted); font-size: 0.67rem; }.shot-heading strong { display: block; margin-top: 3px; font-family: var(--font-display); font-size: 1rem; }.shot-heading button { align-self: flex-start; padding: 6px 8px; border-radius: 4px; background: var(--accent-primary); color: var(--accent-contrast); font-size: 0.65rem; font-weight: 700; }
.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin: 18px 0; }.metric-grid > div { padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; }.metric-grid strong { display: block; margin: 3px 0; font-family: var(--font-display); font-size: 1.03rem; }.metric-grid em { color: var(--success); font-size: 0.61rem; font-style: normal; }.orders { border-top: 1px solid var(--border-color); }.orders-title { display: flex; justify-content: space-between; padding: 12px 0 7px; font-size: 0.7rem; }.orders-title span { color: var(--text-muted); }.order-row { display: grid; grid-template-columns: 25px 1fr auto; align-items: center; gap: 8px; padding: 8px 0; border-top: 1px solid var(--border-color); }.order-avatar { display: grid; width: 25px; height: 25px; place-items: center; border-radius: 50%; background: var(--surface-subtle); color: var(--accent-primary); font-size: 0.66rem; font-weight: 800; }.order-row strong { display: block; font-size: 0.68rem; }.order-row b { color: var(--text-secondary); font-size: 0.63rem; }
@media (max-width: 1100px) { .hero-grid { grid-template-columns: 1fr; }.hero-copy { max-width: 700px; }.product-shot { width: min(620px, calc(100% - 14px)); justify-self: center; }.booking-preview { right: 4%; } }
@media (max-width: 700px) { .booking-preview { position: static; width: min(360px, 100%); margin-top: 4px; justify-self: center; } }
@media (max-width: 520px) { .hero { padding-top: 50px; padding-bottom: 40px; }.hero-notes { display: grid; grid-template-columns: 1fr 1fr; }.shot-content { grid-template-columns: 82px minmax(0, 1fr); }.shot-content aside { font-size: 0.6rem; }.shot-main { min-width: 0; padding: 13px; }.metric-grid { gap: 5px; }.metric-grid > div { min-width: 0; padding: 7px; }.metric-grid strong { font-size: 0.82rem; }.metric-grid em { display: none; }.order-row small { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
</style>
