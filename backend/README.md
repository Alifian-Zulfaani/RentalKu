# RentalKu Backend

API perusahaan RentalKu untuk pendaftaran publik dan pengelolaan subscriber admin. Dibangun dengan Express dan SQLite (`better-sqlite3`).

## Menjalankan lokal

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

API berjalan di `http://localhost:3000` secara default. Gunakan `npm run seed` bila perlu membuat data awal. Atur `JWT_SECRET`, `CORS_ORIGIN`, dan `PORT` melalui `.env` sebelum deploy.

## Struktur singkat

- `src/routes`: definisi endpoint dan validasi request.
- `src/controllers`: logika API.
- `src/middleware/auth.js`: autentikasi JWT admin.
- `src/config/database.js`: inisialisasi SQLite dan skema data.

Kontrak endpoint yang dipakai frontend ada di [docs/api-contract.md](docs/api-contract.md). Dokumen ini adalah acuan saat backend dimigrasikan.
