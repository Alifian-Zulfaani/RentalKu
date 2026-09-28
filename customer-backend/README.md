# Summit Gear Customer Backend

REST API untuk frontend customer dan panel admin rental perlengkapan outdoor. Dibangun dengan Node.js, Express, SQLite (`better-sqlite3`), JWT, dan `express-validator`.

## Fitur

- Katalog, kategori, profil perusahaan, dan booking publik.
- Booking atomik dengan perhitungan tarif serta reservasi stok.
- Autentikasi JWT untuk endpoint admin.
- Pengelolaan inventaris, pelanggan, order, status sewa, dan konfigurasi website.
- Filter, pencarian, pagination, validasi input, dan respons error terstruktur.

## Menjalankan lokal

```bash
npm install
npm run seed   # opsional untuk data awal dan akun admin
npm run dev
```

API berjalan di `http://localhost:3001/api`. Salin `.env.example` menjadi `.env` atau sediakan variabel berikut melalui shell/process manager:

```env
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5174
PORT=3001
```

`DB_PATH` dapat diisi dengan path absolut bila database tidak memakai `database.sqlite` di folder proyek. `JWT_SECRET` wajib disediakan pada production.

## Verifikasi

```bash
npm test
```

Kontrak endpoint lengkap tersedia di [docs/api-contract.md](docs/api-contract.md).

