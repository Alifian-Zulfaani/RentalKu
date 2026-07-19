# RentalKu — Backend API

Ini adalah repositori sisi peladen (_backend_) untuk platform **RentalKu**. Aplikasi ini dibangun menggunakan lingkungan **Node.js** dengan _framework_ **Express.js**, serta menggunakan basis data lokal bawaan yakni **SQLite** (`better-sqlite3`).

Tujuan _backend_ ini adalah untuk menyediakan layanan RESTful API untuk melayani kebutuhan _frontend_, mulai dari otentikasi admin, manajemen _subscriber_, hingga pendaftaran klien baru dari halaman publik.

## Keunggulan Menggunakan SQLite di Tahap Ini

Meskipun SQLite merupakan _database_ berbasis file tunggal, pustaka `better-sqlite3` yang digunakan di aplikasi ini berjalan secara _synchronous_ dan sangat cepat. Dengan mode **WAL (Write-Ahead Logging)** yang telah diaktifkan, _database_ ini sanggup menangani banyak transaksi (baca/tulis) secara bersamaan, sangat memadai untuk tahap pengembangan awal (MVP) maupun peluncuran skala menengah tanpa perlu melakukan setup _database server_ terpisah.

## Struktur Direktori & Penjelasan File

Aplikasi ini menggunakan pola arsitektur **MVC (Model-View-Controller) tanpa Model fisik** (karena mengeksekusi langsung _raw SQL query_). Berikut adalah panduan isi dari direktori `backend/`:

### 📁 Root Directory

- **`database.sqlite`**: File krusial tempat seluruh data asli Anda tersimpan (data admin & subscriber). Anda akan melihat juga `database.sqlite-wal` dan `database.sqlite-shm` yang otomatis dibuat oleh SQLite untuk mempercepat proses tulis-baca.
- **`package.json`**: Menampung skrip Node.js (seperti `npm run dev`) serta daftar pustaka/dependensi seperti `express`, `jsonwebtoken`, `bcryptjs`, dan `better-sqlite3`.

### 📂 Direktori `src/` (Source Code)

Ini adalah folder utama di mana semua logika API bersarang:

- **`index.js`**  
  File utama (_Entry Point_). Berfungsi untuk menginisialisasi server Express.js, mengatur keamanan dasar seperti CORS, serta mendaftarkan rute (API endpoints).
- **`seed.js`**  
  Skrip pendukung untuk memasukkan data awal (_dummy_ atau kredensial _default_), misalnya membuat akun Admin pertama kali ke dalam tabel `admins` agar Anda bisa _login_.

#### 1. `config/`

- **`database.js`**: File ini bertanggung jawab untuk menghubungkan aplikasi Node.js ke file `database.sqlite`. Selain itu, file ini secara otomatis menjalankan perintah _raw SQL_ (`CREATE TABLE IF NOT EXISTS`) untuk membuat struktur tabel `admins` dan `subscribers` saat server pertama kali dinyalakan.

#### 2. `controllers/`

_Controller_ adalah otak dari setiap rute. Di sini logika bisnis dieksekusi (membaca dari database, validasi, dan mengembalikan respons JSON).

- **`authController.js`**: Menangani logika otentikasi admin (memeriksa _username/password_ dengan _bcrypt_, lalu menerbitkan token JWT).
- **`publicController.js`**: Menangani _request_ publik yang tidak memerlukan token _login_. Misalnya, memproses data pengiriman form _Order/Checkout_ pelanggan baru dari halaman depan (Landing Page).
- **`subscriberController.js`**: Menangani operasi _CRUD_ (Create, Read, Update, Delete) terkait data klien/subscriber. Seperti membaca daftar subscriber, mengubah status pembayaran (Pending/Confirmed), dan menghapus data subscriber.

#### 3. `middleware/`

Middleware bertindak sebagai gerbang atau penengah keamanan sebelum _request_ mencapai _Controller_.

- **`auth.js`**: Middleware ini bertugas memeriksa keberadaan dan keabsahan Token JWT pada area _header authorization_. Jika token valid, permintaan dilanjutkan; jika tidak, akses akan ditolak (401 Unauthorized).

#### 4. `routes/`

Memetakan URL endpoints API (misalnya `/api/subscribers`) dengan fungsi _Controller_ yang sesuai.

- **`auth.js`**: Mendaftarkan rute `/api/auth/login`.
- **`public.js`**: Mendaftarkan rute publik seperti `/api/public/checkout`.
- **`subscribers.js`**: Mendaftarkan rute manajemen data subscriber. Kebanyakan rute di sini dilindungi oleh `middleware/auth.js`.

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
4. Jalankan _server_ dalam mode pengembangan (otomatis _restart_ jika ada perubahan _file_):
   ```bash
   npm run dev
   ```
5. _Backend API_ Anda sekarang berjalan, umumnya pada `http://localhost:3000` (tergantung konfigurasi).
