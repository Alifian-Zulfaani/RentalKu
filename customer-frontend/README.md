# Summit Gear (SewaScale) — Frontend

Aplikasi Sisi Klien (_Frontend_) untuk **Summit Gear** (Sistem Sewa Peralatan). Repositori ini dibangun menggunakan teknologi mutakhir: **Vue 3 (Composition API)**, di-_bundling_ menggunakan alat ultra-cepat **Vite**, dan dikelola informasinya (State) menggunakan **Pinia**.

Seluruh antarmuka (UI) dirancang dengan desain bersih, berbalut tema **Glassmorphism**, serta sistem gaya **Light/Dark Mode** yang bisa disesuaikan dan diterapkan seketika tanpa memerlukan pustaka CSS eksternal raksasa (_Tailwind_/_Bootstrap_).

## Fitur Utama

1. **Light / Dark Mode Dinamis**: Tersimpan dalam `localStorage` menggunakan Pinia (`theme.js`), terintegrasi di komponen Navigasi Publik dan _Header_ Admin. Warna latar belakang elemen _native_ (`dropdown/select`, `date`) disinkronkan secara global lewat properti `color-scheme`.
2. **Scroll to Top Pintar**: Tombol gulir melayang di Halaman Utama (Publik) yang membantu pengunjung bernavigasi ke bagian atas katalog secara ergonomis dan interaktif.
3. **Pemesanan (_Booking_) Cepat**: Halaman utama menyediakan form interaktif satu halaman penuh yang memungkinkan _customer_ memilih berbagai perlengkapan secara bersamaan.
4. **Custom Confirm Modals (Anti-Alert)**: Semua dialog admin bawaan _browser_ yang kaku (`alert/confirm`) digantikan secara menyeluruh oleh `ConfirmModal.vue`. Modal _glassmorphism_ modern dengan transisi khusus dan kustomisasi ikon ini digunakan untuk Hapus Data, Ganti Status Order, dan Keluar (_Logout_).
5. **Paginasi & Manajemen Data Tingkat Lanjut**: Tabel di panel admin kini lebih _clean_ dengan pendekatan seperti _DataTables_, terhubung secara akurat dengan respons batas ukuran halaman (paginasi) di sisi _backend_.

## Struktur Direktori `src/`

Berikut adalah rincian fungsional isi direktori `src` yang mendasari struktur proyek:

- **`assets/`**
  - `main.css`: Nyawa desain visual sistem. Berisi definisi _variabel_ CSS tingkat dewa (untuk pewarnaan primer, sekunder, warna sistem untuk mode Terang dan Gelap), utilitas komponen (_button, badge, table, modal_), animasi kustom, serta pengaturan _Glassmorphism_.
- **`components/`**
  Dipecah menjadi `admin/` dan `public/`.
  - **Admin**: Menyimpan `AdminLayout.vue` (bingkai sidebar dan header navigasi admin) serta komponen utilitas superior `ConfirmModal.vue`.
  - **Public**: Menyimpan kepingan UI untuk halaman depan pelanggan seperti `Navbar.vue`, `HeroSection.vue`, `CatalogSection.vue`, form `BookingSection.vue`, dan utilitas melayang `ScrollToTop.vue`.
- **`router/`**
  Sistem navigasi (_Router_). Memetakan URL path yang dapat diakses (misal: `/admin/inventory`) ke _view file_ terkait, dan menyediakan _navigation guard_ (Pengecek Otentikasi) yang mencegah pengunjung anonim membuka tautan `/admin`.
- **`services/`**
  - `api.js`: Konfigurasi basis untuk alat `axios`. Di sini diatur kemana arah `BaseURL` _backend_ memanggil, serta memprogram injeksi _Token JWT_ secara otomatis pada setiap permintaan dari Administrator.
- **`stores/`**
  Menangani lalu-lintas data reaktif yang diakses oleh berbagai halaman menggunakan **Pinia**.
  - `auth.js`: Menyimpan informasi Admin login dan token sesi.
  - `theme.js`: Menyimpan preferensi skema warna Mode Gelap/Terang milik perangkat saat ini.
- **`views/`**
  Menampung kerangka kerja tampilan utama (Halaman).
  - **Public**: `LandingPage.vue` (Menyusun urutan komponen menjadi antarmuka utama beranda untuk _Customer_).
  - **Admin**: Halaman inti panel kontrol seperti `DashboardPage.vue`, `InventoryPage.vue` (berisi _Modal Form_ penambahan/pengeditan Inventaris), `OrdersPage.vue` (berisi tombol aksi status penyewaan), dan `SettingsPage.vue`.

## Cara Menjalankan Proyek Secara Lokal

1. Buka _Terminal_ dari dalam folder `customer-frontend`.
2. Unduh semua paket/dependensi terkait (_Axios, Vue-Router, Lucide-Icons, dll_):
   ```bash
   npm install
   ```
3. Mulai jalankan _server_ kompilasi _development_ (Vite):
   ```bash
   npm run dev
   ```
4. Buka URL yang tertera di layar terminal Anda (umumnya `http://localhost:5173/`).
