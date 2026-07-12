# Summit Gear (SewaScale) — Frontend

Aplikasi Sisi Klien (*Frontend*) untuk **Summit Gear** (Sistem Sewa Peralatan). Repositori ini dibangun menggunakan teknologi mutakhir: **Vue 3 (Composition API)**, di-*bundling* menggunakan alat ultra-cepat **Vite**, dan dikelola informasinya (State) menggunakan **Pinia**.

Seluruh antarmuka (UI) dirancang dengan desain bersih, berbalut tema **Glassmorphism**, serta sistem gaya **Light/Dark Mode** yang bisa disesuaikan dan diterapkan seketika tanpa memerlukan pustaka CSS eksternal raksasa (*Tailwind*/*Bootstrap*).

## Fitur Utama

1. **Light / Dark Mode Dinamis**: Tersimpan dalam `localStorage` menggunakan Pinia (`theme.js`), terintegrasi di komponen Navigasi Publik dan *Header* Admin. Warna latar belakang elemen *native* (`dropdown/select`, `date`) disinkronkan secara global lewat properti `color-scheme`.
2. **Scroll to Top Pintar**: Tombol gulir melayang di Halaman Utama (Publik) yang membantu pengunjung bernavigasi ke bagian atas katalog secara ergonomis dan interaktif.
3. **Pemesanan (*Booking*) Cepat**: Halaman utama menyediakan form interaktif satu halaman penuh yang memungkinkan *customer* memilih berbagai perlengkapan secara bersamaan.
4. **Custom Confirm Modals (Anti-Alert)**: Semua dialog admin bawaan *browser* yang kaku (`alert/confirm`) digantikan secara menyeluruh oleh `ConfirmModal.vue`. Modal *glassmorphism* modern dengan transisi khusus dan kustomisasi ikon ini digunakan untuk Hapus Data, Ganti Status Order, dan Keluar (*Logout*).
5. **Paginasi & Manajemen Data Tingkat Lanjut**: Tabel di panel admin kini lebih *clean* dengan pendekatan seperti *DataTables*, terhubung secara akurat dengan respons batas ukuran halaman (paginasi) di sisi *backend*.

## Struktur Direktori `src/`

Berikut adalah rincian fungsional isi direktori `src` yang mendasari struktur proyek:

*   **`assets/`**
    *   `main.css`: Nyawa desain visual sistem. Berisi definisi *variabel* CSS tingkat dewa (untuk pewarnaan primer, sekunder, warna sistem untuk mode Terang dan Gelap), utilitas komponen (*button, badge, table, modal*), animasi kustom, serta pengaturan *Glassmorphism*.
*   **`components/`**
    Dipecah menjadi `admin/` dan `public/`.
    *   **Admin**: Menyimpan `AdminLayout.vue` (bingkai sidebar dan header navigasi admin) serta komponen utilitas superior `ConfirmModal.vue`.
    *   **Public**: Menyimpan kepingan UI untuk halaman depan pelanggan seperti `Navbar.vue`, `HeroSection.vue`, `CatalogSection.vue`, form `BookingSection.vue`, dan utilitas melayang `ScrollToTop.vue`.
*   **`router/`**
    Sistem navigasi (*Router*). Memetakan URL path yang dapat diakses (misal: `/admin/inventory`) ke *view file* terkait, dan menyediakan *navigation guard* (Pengecek Otentikasi) yang mencegah pengunjung anonim membuka tautan `/admin`.
*   **`services/`**
    *   `api.js`: Konfigurasi basis untuk alat `axios`. Di sini diatur kemana arah `BaseURL` *backend* memanggil, serta memprogram injeksi *Token JWT* secara otomatis pada setiap permintaan dari Administrator.
*   **`stores/`**
    Menangani lalu-lintas data reaktif yang diakses oleh berbagai halaman menggunakan **Pinia**.
    *   `auth.js`: Menyimpan informasi Admin login dan token sesi.
    *   `theme.js`: Menyimpan preferensi skema warna Mode Gelap/Terang milik perangkat saat ini.
*   **`views/`**
    Menampung kerangka kerja tampilan utama (Halaman).
    *   **Public**: `LandingPage.vue` (Menyusun urutan komponen menjadi antarmuka utama beranda untuk *Customer*).
    *   **Admin**: Halaman inti panel kontrol seperti `DashboardPage.vue`, `InventoryPage.vue` (berisi *Modal Form* penambahan/pengeditan Inventaris), `OrdersPage.vue` (berisi tombol aksi status penyewaan), dan `SettingsPage.vue`.

## Cara Menjalankan Proyek Secara Lokal

1. Buka *Terminal* dari dalam folder `customer-frontend`.
2. Unduh semua paket/dependensi terkait (*Axios, Vue-Router, Lucide-Icons, dll*):
   ```bash
   npm install
   ```
3. Mulai jalankan *server* kompilasi *development* (Vite):
   ```bash
   npm run dev
   ```
4. Buka URL yang tertera di layar terminal Anda (umumnya `http://localhost:5173/`).
