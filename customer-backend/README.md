# Summit Gear (SewaScale) — Backend API

Ini adalah peladen (_backend_) untuk platform **Summit Gear (SewaScale)** khusus versi aplikasi terpisah (Customer). Aplikasi ini dibangun dengan menggunakan lingkungan **Node.js** dan _framework_ **Express.js**, bersanding dengan basis data lokal **SQLite** (`better-sqlite3`).

Tujuan utama sistem _backend_ ini adalah untuk melayani permintaan dari _frontend_, baik untuk memuat data katalog dan memproses pesanan masuk secara publik, maupun menyediakan fungsionalitas CRUD lengkap bagi Admin.

## Struktur Direktori & File Utama

Aplikasi menggunakan pendekatan desain pola arsitektur **MVC (tanpa direktori Model)**, karena semua operasi database menggunakan _raw query_ langsung dari _controller_.

### 📁 Direktori Root

- **`database.sqlite`**: File inti di mana seluruh tabel data (admins, config, inventory, orders, customers) disimpan secara fisik. Aplikasi ini menggunakan mode **WAL (Write-Ahead Logging)** yang menjamin kecepatan eksekusi dan keamanan baca-tulis tingkat tinggi.
- **`package.json`**: Menampung skrip Node.js (seperti `npm run dev`) serta daftar dependensi seperti `express`, `jsonwebtoken`, `bcryptjs`, dan `better-sqlite3`.

### 📂 Direktori `src/` (Source Code)

Seluruh logika inti diletakkan di dalam folder ini:

#### 1. `config/`

- **`database.js`**: Mengonfigurasi dan menyambungkan _backend_ ke file `database.sqlite`. Secara otomatis menjalankan sintaks _migration_ (`CREATE TABLE IF NOT EXISTS`) untuk mendefinisikan tabel-tabel utama (Inventory, Orders, Customers, dll) ketika peladen dijalankan.

#### 2. `controllers/`

Pusat logika bisnis. Mengeksekusi permintaan, membaca/memodifikasi basis data, lalu mengembalikan respons berformat JSON.

- **`publicController.js`**: Menangani seluruh _request_ publik tanpa token (Misal: memuat profil web, mengambil daftar barang untuk katalog, dan merekam pengajuan pesanan/booking baru).
- **`inventoryController.js`**: (Khusus Admin) Mengelola CRUD data barang dan kategori. Memiliki dukungan paginasi dan filter.
- **`orderController.js`**: (Khusus Admin) Membaca daftar pesanan masuk dan mengubah status pesanan (contoh: dari _booking_ menjadi _active_ atau _completed_).
- **`customerController.js`**: (Khusus Admin) Melihat daftar basis pelanggan dan memberikan status (_blacklist_ jika diperlukan).
- **`siteConfigController.js`**: (Khusus Admin) Mengubah informasi dasar profil perusahaan seperti nama _brand_, logo, dan skema warna utama.
- **`authController.js`**: Memvalidasi proses _login_ admin dengan `bcryptjs` dan memproduksi akses token menggunakan JWT.

#### 3. `middleware/`

- **`auth.js`**: Penengah keamanan (_Gatekeeper_). Memastikan bahwa setiap permintaan (khusus _controller_ Admin) yang masuk memiliki Token JWT (_Authorization Header_) yang valid. Jika tidak valid, akses akan ditolak (Status 401).

#### 4. `routes/`

Memetakan dan mendistribusikan _URL endpoints_ API yang diakses _frontend_ ke fungsi _controller_ yang sesuai (contoh: `/api/inventory` diarahkan ke `inventoryController`).

### 📄 Skrip Utama

- **`index.js`**: Titik masuk (_Entry Point_). Menginisialisasi _server_ Express, mengatur rute global, serta menyediakan proteksi dasar menggunakan _CORS_.
- **`seed.js`**: Skrip bantu (_seeder_) untuk menanamkan kredensial akun Admin _default_ dan pengaturan web _default_ ke dalam database agar sistem bisa langsung digunakan.

## Cara Menjalankan Proyek Secara Lokal

1. Buka terminal pada folder `customer-backend`.
2. Instal pustaka pendukung dengan perintah:
   ```bash
   npm install
   ```
3. _(Opsional)_ Jika Anda baru pertama kali menjalankan proyek ini dan butuh _user_ admin bawaan, jalankan:
   ```bash
   npm run seed
   ```
4. Jalankan _server_ dalam mode pengembangan (Otomatis muat-ulang jika ada kode yang diubah):
   ```bash
   npm run dev
   ```
5. _Backend API_ Anda sudah berjalan!
