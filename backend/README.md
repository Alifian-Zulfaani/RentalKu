# RentalKu Backend

API platform RentalKu untuk pendaftaran early access aplikasi Rental dan Booking serta peninjauan pendaftar oleh admin. Dibangun dengan Express dan SQLite (`better-sqlite3`). Satu tabel `subscribers` membedakan produk melalui `product_type`.

## Fitur

- Pendaftaran publik untuk Rental atau Booking dengan biaya Rp0 yang ditetapkan server.
- Autentikasi JWT dan panel data pendaftar yang dapat difilter menurut produk atau status.
- Statistik pendaftaran, perubahan status, pencarian, dan pagination.
- Persetujuan pendaftaran belum otomatis membuat tenant, akun, atau subdomain di aplikasi bisnis.

## Menjalankan lokal

```powershell
npm install
npm run dev
```

API berjalan di `http://localhost:3000/api`. Jalankan `frontend/` di port `5173` untuk mengakses situs dan panel admin.

## Konfigurasi

| Variabel | Kegunaan | Default |
| --- | --- | --- |
| `PORT` | Port HTTP | `3000` |
| `JWT_SECRET` | Penanda tangan token admin; wajib di production | Fallback pengembangan |
| `CORS_ORIGIN` | Origin frontend yang diizinkan, dipisah koma | `http://localhost:5173` |
| `DB_PATH` | Path file SQLite | `database.sqlite` di folder backend |

Salin `.env.example` menjadi `.env` bila ingin menyimpan konfigurasi lokal. File `.env` dimuat otomatis bila tersedia; variabel lingkungan proses tetap diutamakan. Gunakan Node.js 20.12 atau lebih baru. Jangan gunakan secret pengembangan di produksi.

## Data awal

Untuk membuat admin pada database kosong, isi `SEED_ADMIN_PASSWORD` (minimal 12 karakter) di lingkungan proses atau `.env`, lalu jalankan `npm run seed`. `SEED_ADMIN_EMAIL` opsional; default `admin@rentalku.com`. Seed tidak membuat pendaftar contoh. Untuk mengganti kata sandi admin yang sudah ada, jalankan `npm run seed -- --rotate` dengan variabel tersebut. Mode production menolak akun yang masih memakai kata sandi seed bawaan.

`npm run db:reset:dev` membuat backup di `.local-backups/`, menghapus pendaftar dari database lokal default, dan mempertahankan admin. Perintah ditolak dalam mode production atau saat `DB_PATH` digunakan. Backup berisi data pribadi; simpan dengan aman dan jangan commit ke Git.

## Verifikasi

```powershell
npm test
```

## Dokumentasi

Lihat [kontrak API platform](docs/api-contract.md) untuk format respons dan seluruh endpoint. Keputusan `confirmed` berarti pendaftaran disetujui, **bukan** aplikasi tenant sudah otomatis aktif.
