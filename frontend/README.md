# RentalKu — Frontend

RentalKu adalah platform manajemen rental untuk UMKM di Indonesia. Proyek frontend ini dibangun menggunakan **Vue 3 (Composition API)**, **Vite**, **Pinia** (State Management), dan **Vue Router**.

Tampilan antarmuka (UI) dirancang menggunakan *Vanilla CSS* dengan sentuhan *Glassmorphism*, palet warna premium, serta dukungan **Light Mode dan Dark Mode**.

## Fitur Utama & Pembaruan Terakhir

1. **Light / Dark Mode terintegrasi**: Menggunakan Pinia (`theme.js`) yang disimpan ke dalam `localStorage`. Sistem ini otomatis mengatur CSS Variable melalui tag HTML `data-theme`.
2. **Custom Confirm Modal**: Fitur konfirmasi di panel Admin menggunakan Modal buatan kustom yang mulus dan elegan, menggantikan alert `confirm()` bawaan browser yang kaku.
3. **Scroll to Top**: Tombol *Scroll to Top* pada tampilan publik (Beranda dan halaman Order) untuk mempermudah navigasi pengguna setelah melakukan *scroll* panjang.
4. **Desain Modern (Glassmorphism)**: Tampilan UI secara keseluruhan bersifat dinamis, memiliki transisi warna yang halus, kartu (*card*) transparan dengan *backdrop-filter*, dan kompatibel penuh pada perangkat *mobile* (responsif).

## Struktur Direktori & File Utama

Berikut adalah penjelasan mengenai struktur direktori di dalam folder `src/` yang merupakan inti dari aplikasi ini:

### 📂 Direktori

*   **`assets/`**
    Digunakan untuk menyimpan berkas aset statis seperti gambar, ikon, atau berkas *style* global.
    *   `main.css`: Berkas CSS utama yang mendefinisikan desain sistem secara keseluruhan (termasuk *variables* untuk light/dark mode, *reset*, dan komponen kelas utilitas).
    
*   **`components/`**
    Berisi komponen Vue murni yang sifatnya *reusable* (dapat dipakai ulang di banyak halaman). Direktori ini dipisah menjadi:
    *   `admin/`: Komponen khusus halaman admin, seperti `AdminLayout.vue` (kerangka panel admin) dan `ConfirmModal.vue` (modal konfirmasi aksi admin).
    *   `public/`: Komponen khusus halaman publik (landing page), seperti `Navbar.vue`, `FooterSection.vue`, `HeroSection.vue`, hingga tombol pintar `ScrollToTop.vue`.
    
*   **`router/`**
    Konfigurasi rute atau navigasi halaman menggunakan Vue Router. Memetakan URL path dengan komponen halaman (Views) yang sesuai.
    
*   **`services/`**
    Modul yang menangani layanan eksternal. Biasanya berisi `api.js` untuk melakukan konfigurasi modul pemanggilan API (*misal: Axios fetcher*), lengkap dengan pengaturan *Base URL* atau *Interceptors*.
    
*   **`stores/`**
    Pengelolaan *state* aplikasi global menggunakan **Pinia**.
    *   `auth.js`: Menyimpan dan mengelola data login / otentikasi admin.
    *   `theme.js`: Menyimpan status mode warna saat ini (Light / Dark) dan mengaturnya.
    
*   **`views/`**
    Berisi komponen yang bertindak sebagai "halaman utama" (*pages*). Sama seperti components, direktori ini dibagi menjadi:
    *   `admin/`: Contoh halamannya adalah `DashboardPage.vue`, `SubscriberPage.vue`, dan `LoginPage.vue`.
    *   `public/`: Contoh halamannya adalah `LandingPage.vue` (halaman utama) dan `OrderPage.vue`.

### 📄 File Utama

*   **`App.vue`**
    Komponen *root* dari aplikasi Vue. File ini menjadi titik masuk untuk menampilkan rute-rute (menggunakan `<router-view />`).
*   **`main.js`**
    Skrip utama (Entry point) yang menginisialisasi *instance* aplikasi Vue. File ini bertugas melakukan instalasi *plugins* seperti Pinia, Router, dan mengaitkan (mount) aplikasi ke dalam DOM (`#app`).
*   **`package.json`**
    Konfigurasi manajer paket berbasis Node.js yang berisi daftar skrip perintah (`npm run dev`) serta pustaka / dependensi (seperti Vue, Axios, Lucide-Vue-Next) yang digunakan oleh aplikasi.
*   **`vite.config.js`**
    Konfigurasi alat *build* Vite, biasanya mengatur *plugins* (seperti dukungan *plugin vue*) dan opsi server *development*.

## Menjalankan Proyek Secara Lokal

1. Pastikan Anda telah menginstal Node.js di komputer Anda.
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan *development server*:
   ```bash
   npm run dev
   ```
4. Buka URL yang dihasilkan (misalnya `http://localhost:5173/`) melalui browser Anda.
