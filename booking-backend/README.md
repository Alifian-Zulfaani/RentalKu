# RentalKu Booking Backend

API reservasi jasa berbasis jadwal untuk satu bisnis, dengan **Studio Senja** dan fotografernya sebagai data contoh. Dibangun dengan Express, SQLite (`better-sqlite3`), JWT, dan bcrypt.

## Fitur

- Profil studio, fotografer, layanan, paket, dan harga per fotografer.
- Kalender ketersediaan dari jam kerja, durasi layanan, reservasi aktif, dan blokir admin.
- Reservasi dalam transaksi SQLite; slot bentrok ditolak dan pembatalan membuka slot kembali.
- Panel admin dengan role `company` (studio) dan `photographer`; cakupan data diperiksa dari database pada setiap request.

## Menjalankan lokal

```powershell
npm install
npm run dev
```

API berjalan di `http://localhost:3002/api`. Jalankan `booking-frontend/` di port `5175` untuk mengakses situs dan panel admin.

## Konfigurasi

| Variabel | Kegunaan | Default |
| --- | --- | --- |
| `PORT` | Port HTTP | `3002` |
| `JWT_SECRET` | Penanda tangan token admin; wajib di production | Fallback pengembangan |
| `CORS_ORIGIN` | Origin frontend yang diizinkan, dipisah koma | `http://localhost:5175,http://*.localhost:5175` |
| `DB_PATH` | Path file SQLite | `database.sqlite` di folder backend |
| `BOOKING_TIME_ZONE` | Zona waktu bisnis untuk tanggal/jam booking | `Asia/Jakarta` |

`.env.example` adalah contoh nilai konfigurasi. Backend ini membaca variabel **dari lingkungan proses**, bukan memuat `.env` otomatis; set variabel melalui shell atau process manager sebelum menjalankan API. Seed membuat kredensial demo yang tercatat di kode seed; ganti semua kata sandi demo dan `JWT_SECRET` sebelum produksi.

## Data awal

Jalankan `npm run seed` untuk mengisi Studio Senja, fotografer Naya dan Arya, layanan, jadwal, serta akun contoh. Seed tidak diperlukan untuk menjalankan API, tetapi halaman contoh memerlukan data tersebut. Kredensial demo ada di kode seed dan harus diganti sebelum produksi.

## Verifikasi

```powershell
npm test
```

## Struktur kode

Strukturnya mengikuti backend RentalKu dan Summit Gear:

- `src/config`: konfigurasi environment dan koneksi SQLite.
- `src/controllers`: handler publik, autentikasi, dan operasional admin.
- `src/middleware`: autentikasi serta pembatasan role.
- `src/routes`: pemetaan endpoint publik dan admin.
- `src/services`: aturan booking, tenant, dan perhitungan ketersediaan.
- `src/utils`: helper respons dan penanganan error HTTP.
- `test`: pengujian integrasi kontrak API dan aturan bisnis.

## Dokumentasi

Lihat [kontrak API booking](docs/api-contract.md) untuk format respons, endpoint, role, dan aturan ketersediaan slot. Tanggal dan jam booking disimpan sebagai waktu lokal bisnis (`YYYY-MM-DD`, `HH:MM`).
