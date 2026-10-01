# RentalKu Backend

API platform RentalKu untuk pendaftaran produk Rental dan Booking serta pengelolaan subscriber admin. Dibangun dengan Express dan SQLite (`better-sqlite3`). Satu tabel `subscribers` memakai kolom `product_type` (`rental` atau `booking`); data lama dimigrasikan sebagai `rental` saat aplikasi dimulai.

## Menjalankan lokal

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

API berjalan di `http://localhost:3000` secara default. Gunakan `npm run seed` bila perlu membuat data awal. Atur `JWT_SECRET`, `CORS_ORIGIN`, dan `PORT` melalui `.env` sebelum deploy.
Gunakan `DB_PATH` bila lokasi SQLite perlu dipindahkan. Jalankan `npm test` untuk verifikasi pendaftaran dan filter dua produk.

## Struktur singkat

- `src/routes`: definisi endpoint dan validasi request.
- `src/controllers`: logika API.
- `src/middleware/auth.js`: autentikasi JWT admin.
- `src/config/database.js`: inisialisasi SQLite dan skema data.

Endpoint daftar subscriber menerima filter `product_type`, sedangkan statistik menyertakan ringkasan per produk. [Kontrak endpoint](docs/api-contract.md).
