# Summit Gear (SewaScale) — Backend API

Ini adalah peladen (*backend*) untuk platform **Summit Gear (SewaScale)** khusus versi aplikasi terpisah (Customer). Aplikasi ini dibangun dengan menggunakan lingkungan **Node.js** dan *framework* **Express.js**, bersanding dengan basis data lokal **SQLite** (`better-sqlite3`).

Tujuan utama sistem *backend* ini adalah untuk melayani permintaan dari *frontend*, baik untuk memuat data katalog dan memproses pesanan masuk secara publik, maupun menyediakan fungsionalitas CRUD lengkap bagi Admin.

## Struktur Direktori & File Utama

Aplikasi menggunakan pendekatan desain pola arsitektur **MVC (tanpa direktori Model)**, karena semua operasi database menggunakan *raw query* langsung dari *controller*.

### 📁 Direktori Root
*   **`database.sqlite`**: File inti di mana seluruh tabel data (admins, config, inventory, orders, customers) disimpan secara fisik. Aplikasi ini menggunakan mode **WAL (Write-Ahead Logging)** yang menjamin kecepatan eksekusi dan keamanan baca-tulis tingkat tinggi.
*   **`package.json`**: Menampung skrip Node.js (seperti `npm run dev`) serta daftar dependensi seperti `express`, `jsonwebtoken`, `bcryptjs`, dan `better-sqlite3`.

### 📂 Direktori `src/` (Source Code)
Seluruh logika inti diletakkan di dalam folder ini:

#### 1. `config/`
*   **`database.js`**: Mengonfigurasi dan menyambungkan *backend* ke file `database.sqlite`. Secara otomatis menjalankan sintaks *migration* (`CREATE TABLE IF NOT EXISTS`) untuk mendefinisikan tabel-tabel utama (Inventory, Orders, Customers, dll) ketika peladen dijalankan.

#### 2. `controllers/`
Pusat logika bisnis. Mengeksekusi permintaan, membaca/memodifikasi basis data, lalu mengembalikan respons berformat JSON.
*   **`publicController.js`**: Menangani seluruh *request* publik tanpa token (Misal: memuat profil web, mengambil daftar barang untuk katalog, dan merekam pengajuan pesanan/booking baru).
*   **`inventoryController.js`**: (Khusus Admin) Mengelola CRUD data barang dan kategori. Memiliki dukungan paginasi dan filter.
*   **`orderController.js`**: (Khusus Admin) Membaca daftar pesanan masuk dan mengubah status pesanan (contoh: dari *booking* menjadi *active* atau *completed*).
*   **`customerController.js`**: (Khusus Admin) Melihat daftar basis pelanggan dan memberikan status (*blacklist* jika diperlukan).
*   **`siteConfigController.js`**: (Khusus Admin) Mengubah informasi dasar profil perusahaan seperti nama *brand*, logo, dan skema warna utama.
*   **`authController.js`**: Memvalidasi proses *login* admin dengan `bcryptjs` dan memproduksi akses token menggunakan JWT.

#### 3. `middleware/`
*   **`auth.js`**: Penengah keamanan (*Gatekeeper*). Memastikan bahwa setiap permintaan (khusus *controller* Admin) yang masuk memiliki Token JWT (*Authorization Header*) yang valid. Jika tidak valid, akses akan ditolak (Status 401).

#### 4. `routes/`
Memetakan dan mendistribusikan *URL endpoints* API yang diakses *frontend* ke fungsi *controller* yang sesuai (contoh: `/api/inventory` diarahkan ke `inventoryController`).

### 📄 Skrip Utama
*   **`index.js`**: Titik masuk (*Entry Point*). Menginisialisasi *server* Express, mengatur rute global, serta menyediakan proteksi dasar menggunakan *CORS*.
*   **`seed.js`**: Skrip bantu (*seeder*) untuk menanamkan kredensial akun Admin *default* dan pengaturan web *default* ke dalam database agar sistem bisa langsung digunakan.

## Cara Menjalankan Proyek Secara Lokal

1. Buka terminal pada folder `customer-backend`.
2. Instal pustaka pendukung dengan perintah:
   ```bash
   npm install
   ```
3. *(Opsional)* Jika Anda baru pertama kali menjalankan proyek ini dan butuh *user* admin bawaan, jalankan:
   ```bash
   npm run seed
   ```
4. Jalankan *server* dalam mode pengembangan (Otomatis muat-ulang jika ada kode yang diubah):
   ```bash
   npm run dev
   ```
5. *Backend API* Anda sudah berjalan!
