# RentalKu — Backend API

Ini adalah repositori sisi peladen (*backend*) untuk platform **RentalKu**. Aplikasi ini dibangun menggunakan lingkungan **Node.js** dengan *framework* **Express.js**, serta menggunakan basis data lokal bawaan yakni **SQLite** (`better-sqlite3`).

Tujuan *backend* ini adalah untuk menyediakan layanan RESTful API untuk melayani kebutuhan *frontend*, mulai dari otentikasi admin, manajemen *subscriber*, hingga pendaftaran klien baru dari halaman publik.

## Keunggulan Menggunakan SQLite di Tahap Ini

Meskipun SQLite merupakan *database* berbasis file tunggal, pustaka `better-sqlite3` yang digunakan di aplikasi ini berjalan secara *synchronous* dan sangat cepat. Dengan mode **WAL (Write-Ahead Logging)** yang telah diaktifkan, *database* ini sanggup menangani banyak transaksi (baca/tulis) secara bersamaan, sangat memadai untuk tahap pengembangan awal (MVP) maupun peluncuran skala menengah tanpa perlu melakukan setup *database server* terpisah.

## Struktur Direktori & Penjelasan File

Aplikasi ini menggunakan pola arsitektur **MVC (Model-View-Controller) tanpa Model fisik** (karena mengeksekusi langsung *raw SQL query*). Berikut adalah panduan isi dari direktori `backend/`:

### 📁 Root Directory
*   **`database.sqlite`**: File krusial tempat seluruh data asli Anda tersimpan (data admin & subscriber). Anda akan melihat juga `database.sqlite-wal` dan `database.sqlite-shm` yang otomatis dibuat oleh SQLite untuk mempercepat proses tulis-baca.
*   **`package.json`**: Menampung skrip Node.js (seperti `npm run dev`) serta daftar pustaka/dependensi seperti `express`, `jsonwebtoken`, `bcryptjs`, dan `better-sqlite3`.

### 📂 Direktori `src/` (Source Code)

Ini adalah folder utama di mana semua logika API bersarang:

*   **`index.js`**  
    File utama (*Entry Point*). Berfungsi untuk menginisialisasi server Express.js, mengatur keamanan dasar seperti CORS, serta mendaftarkan rute (API endpoints).
*   **`seed.js`**  
    Skrip pendukung untuk memasukkan data awal (*dummy* atau kredensial *default*), misalnya membuat akun Admin pertama kali ke dalam tabel `admins` agar Anda bisa *login*.

#### 1. `config/`
*   **`database.js`**: File ini bertanggung jawab untuk menghubungkan aplikasi Node.js ke file `database.sqlite`. Selain itu, file ini secara otomatis menjalankan perintah *raw SQL* (`CREATE TABLE IF NOT EXISTS`) untuk membuat struktur tabel `admins` dan `subscribers` saat server pertama kali dinyalakan.

#### 2. `controllers/`
*Controller* adalah otak dari setiap rute. Di sini logika bisnis dieksekusi (membaca dari database, validasi, dan mengembalikan respons JSON).
*   **`authController.js`**: Menangani logika otentikasi admin (memeriksa *username/password* dengan *bcrypt*, lalu menerbitkan token JWT).
*   **`publicController.js`**: Menangani *request* publik yang tidak memerlukan token *login*. Misalnya, memproses data pengiriman form *Order/Checkout* pelanggan baru dari halaman depan (Landing Page).
*   **`subscriberController.js`**: Menangani operasi *CRUD* (Create, Read, Update, Delete) terkait data klien/subscriber. Seperti membaca daftar subscriber, mengubah status pembayaran (Pending/Confirmed), dan menghapus data subscriber.

#### 3. `middleware/`
Middleware bertindak sebagai gerbang atau penengah keamanan sebelum *request* mencapai *Controller*.
*   **`auth.js`**: Middleware ini bertugas memeriksa keberadaan dan keabsahan Token JWT pada area *header authorization*. Jika token valid, permintaan dilanjutkan; jika tidak, akses akan ditolak (401 Unauthorized).

#### 4. `routes/`
Memetakan URL endpoints API (misalnya `/api/subscribers`) dengan fungsi *Controller* yang sesuai.
*   **`auth.js`**: Mendaftarkan rute `/api/auth/login`.
*   **`public.js`**: Mendaftarkan rute publik seperti `/api/public/checkout`.
*   **`subscribers.js`**: Mendaftarkan rute manajemen data subscriber. Kebanyakan rute di sini dilindungi oleh `middleware/auth.js`.

---

## Cara Menjalankan Aplikasi di Lokal

1. Buka terminal dan arahkan ke folder `backend`.
2. Instal pustaka pendukung:
   ```bash
   npm install
   ```
3. (Opsional) Jika Anda butuh admin bawaan untuk pertama kali, jalankan berkas seeder:
   ```bash
   npm run seed
   ```
4. Jalankan *server* dalam mode pengembangan (otomatis *restart* jika ada perubahan *file*):
   ```bash
   npm run dev
   ```
5. *Backend API* Anda sekarang berjalan, umumnya pada `http://localhost:3000` (tergantung konfigurasi).
