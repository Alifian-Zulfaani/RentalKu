# RentalKu Booking Backend

API reservasi jasa fotografi untuk satu bisnis. Contoh data awal: **Studio Senja**, dengan profil fotografer Naya dan Arya. Dibangun dengan Express, SQLite (`better-sqlite3`), JWT, dan bcrypt.

## Jalankan lokal

```powershell
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

API default: `http://localhost:3002/api`. Seed membuat admin studio `admin@studiosenja.example` / `admin123` dan akun fotografer `naya@studiosenja.example` / `naya123`, `arya@studiosenja.example` / `arya123`. Ganti semua kredensial demo dan `JWT_SECRET` sebelum produksi. Set `DB_PATH` ke path absolut untuk lokasi database lain.

## Model booking

- Satu tenant mempunyai banyak fotografer dan layanan. Tabel penghubung `professional_services` menentukan paket aktif dan harga masing-masing fotografer; harga reservasi disalin saat transaksi dibuat.
- Setiap fotografer punya jam kerja mingguan yang ditampilkan pula di landing page pribadinya.
- Slot tersedia dihitung dari jam kerja, durasi layanan, reservasi aktif, dan waktu yang diblokir admin.
- Penulisan reservasi berlangsung dalam transaksi SQLite. Slot yang bertabrakan mengembalikan `409`; reservasi dibatalkan membuka slot kembali.
- Tanggal dan jam disimpan sebagai waktu lokal bisnis (`YYYY-MM-DD` dan `HH:MM`). Atur `BOOKING_TIME_ZONE` sesuai lokasi bisnis.
- Endpoint admin memakai JWT dan memeriksa role dari database setiap request. Admin studio mengelola seluruh tenant; fotografer hanya dapat mengelola reservasi, profil, paket/harga, jam kerja, dan blokir miliknya. Admin studio dapat membuat akun fotografer dari panel.

Jalankan `npm test` untuk menguji halaman tenant, konflik slot, pembatalan, dan validasi. [Kontrak API lengkap](docs/api-contract.md).
