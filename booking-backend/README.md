# RentalKu Booking Backend

API reservasi jasa berbasis jadwal untuk satu bisnis, dengan **Studio Senja** sebagai contoh. Dibangun dengan Express, SQLite (`better-sqlite3`), JWT, dan bcrypt.

## Fitur

- MVP memakai satu kalender studio, layanan, bio/filosofi, dan portofolio yang dapat dikelola admin. Fitur fotografer tetap tersimpan untuk fase berikutnya.
- Kalender ketersediaan dari jam operasional studio, durasi layanan, seluruh reservasi aktif, dan blokir admin.
- Reservasi dalam transaksi SQLite; slot bentrok ditolak dan pembatalan membuka slot kembali.
- Panel admin dengan role `company` (studio) dan `photographer`; cakupan data diperiksa dari database pada setiap request. Perubahan kata sandi mewajibkan konfirmasi sandi baru yang sama.

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

Jalankan `npm run seed` untuk mengisi Studio Senja, layanan, jadwal studio, karya contoh, dan akun admin. Data fotografer lama tetap dibuat untuk pengembangan fitur berikutnya. Seed tidak diperlukan untuk menjalankan API, tetapi halaman contoh memerlukan data tersebut. Kredensial demo ada di kode seed dan harus diganti sebelum produksi.

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
- `.agents/skills/studio-backend/SKILL.md`: konvensi kerja khusus API dan migrasi Studio Senja.

## Dokumentasi

Lihat [kontrak API booking](docs/api-contract.md) untuk format respons, endpoint, role, dan aturan ketersediaan slot. Tanggal dan jam booking disimpan sebagai waktu lokal bisnis (`YYYY-MM-DD`, `HH:MM`).
