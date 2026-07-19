# Ekosistem Aplikasi Sewa (Rental Platform Ecosystem)

Repositori ini menampung arsitektur lengkap dari sebuah ekosistem _Software as a Service_ (SaaS) yang ditujukan untuk manajemen bisnis penyewaan (rental). Ekosistem ini dirancang dengan pendekatan pemisahan (_decoupled_) yang dibagi menjadi dua entitas utama: **Aplikasi Platform Induk** dan **Aplikasi Penyewa (Customer App)**.

Secara keseluruhan, terdapat 4 sub-repositori (direktori) di dalam ekosistem ini. Berikut adalah penjelasan fungsionalitas dan hubungan antar repositori:

---

## 1. RentalKu Platform (Aplikasi Induk / SaaS)

Aplikasi ini adalah platform utama yang ditujukan untuk pemilik sistem (Anda) guna mencari dan memanajemen bisnis-bisnis rental yang ingin berlangganan/menggunakan sistem Anda.

### 🏢 `frontend/` (Sisi Klien Platform)

- **Fungsi**: Bertindak sebagai _Landing Page_ publik untuk memasarkan layanan _Software_ RentalKu kepada pemilik bisnis rental (UMKM), serta menyediakan Panel Admin sentral.
- **Teknologi**: Vue 3, Vite, Pinia.
- **Fitur Utama**:
  - Halaman pendaftaran (_Checkout/Order_) bagi pemilik bisnis rental yang ingin berlangganan.
  - Halaman _Dashboard Admin_ tempat Anda (pemilik platform) menyetujui, menolak, atau menghapus para pelanggan/penyewa aplikasi (_Subscribers_).
  - Tampilan moderen dengan sistem _Light/Dark Mode_ dan interaksi modal _anti-alert_.

### ⚙️ `backend/` (API Platform)

- **Fungsi**: Melayani data dan logika bisnis untuk `frontend/`.
- **Teknologi**: Node.js, Express.js, SQLite (`better-sqlite3`).
- **Fitur Utama**:
  - Menyimpan basis data global (Kredensial Admin Utama dan Data Pendaftar/Subscriber).
  - Memiliki proteksi JWT untuk rute admin.
  - Database bersifat independen (`database.sqlite`) dan terisolasi dari data bisnis masing-masing penyewa.

---

## 2. SewaScale / Summit Gear (Aplikasi Bisnis / Penyewa)

Aplikasi ini adalah "produk" yang sebenarnya Anda jual/berikan kepada penyewa (UMKM). Aplikasi ini digunakan oleh sang pemilik rental (misal: "Summit Gear") untuk memanajemen operasional tokonya sendiri, serta menjadi etalase (_storefront_) bagi pelanggan akhir mereka.

### 🏕️ `customer-frontend/` (Sisi Klien Bisnis)

- **Fungsi**: Menjadi situs web toko rental alat (seperti alat _camping_ atau _outdoor_) milik penyewa (klien SaaS Anda).
- **Teknologi**: Vue 3, Vite, Pinia.
- **Fitur Utama**:
  - **Area Publik (Customer)**: Menampilkan katalog peralatan, informasi toko, dan menyediakan Formulir _Booking_ Online bagi pelanggan yang ingin menyewa alat.
  - **Area Admin (Toko)**: Panel bagi sang pemilik toko rental untuk mengelola operasi bisnis mereka. Dilengkapi fitur CRUD Inventaris (modal _inline_), mengubah status penyewaan (_booking_ -> _active_ -> _completed_), memanajemen daftar pelanggan, dan mengubah pengaturan toko.
  - Tampilan berbalut UI premium (_Glassmorphism_) dan sistem _Light/Dark Mode_.

### ⚙️ `customer-backend/` (API Bisnis)

- **Fungsi**: Sebagai "otak" di balik operasional toko rental tersebut. Terpisah secara fisik dari backend platform induk.
- **Teknologi**: Node.js, Express.js, SQLite (`better-sqlite3`).
- **Fitur Utama**:
  - Menampung basis data (`database.sqlite`) yang spesifik hanya untuk satu toko rental (terdiri dari tabel: _Inventory_, _Orders_, _Categories_, _Customers_, dan _Site Config_).
  - Menangani kalkulasi sisa stok otomatis, pembacaan paginasi data (_LIMIT OFFSET_), dan penerbitan token JWT khusus untuk pemilik toko (admin toko).

---

## Cara Menjalankan Ekosistem Ini Secara Bersamaan

Karena arsitektur ini memisahkan API dan Klien menjadi proyek-proyek mandiri (mikro-layanan sederhana), Anda harus menjalankan masing-masing direktori secara terpisah. Disarankan menggunakan _terminal multi-tab_ atau _Tmux_.

**Langkah Umum:**

1. Masuk ke masing-masing folder (`cd nama-folder`).
2. Instal pustaka (_dependencies_): `npm install`.
3. _(Khusus backend)_ Jika butuh data _default_: `npm run seed`.
4. Jalankan _server lokal_: `npm run dev` (atau `npm start`).

**Contoh Alokasi Port (Bawaan):**

- **3000** : `backend` (API Platform RentalKu)
- **3001** : `customer-backend` (API Toko Summit Gear)
- **5173** : `frontend` (UI Platform RentalKu)
- **5174** : `customer-frontend` (UI Toko Summit Gear)

---

_Dokumentasi lengkap dan spesifik perihal struktur kode dan cara kerja masing-masing modul dapat dibaca pada file `README.md` yang terdapat di dalam setiap folder._
