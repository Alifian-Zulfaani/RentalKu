# RentalKu

RentalKu adalah ekosistem aplikasi rental yang memisahkan pengelolaan platform dari operasional setiap bisnis rental. Repositori ini berisi dua pasangan aplikasi frontend dan backend yang dapat dijalankan secara mandiri.

## Aplikasi

| Direktori | Peran | Teknologi utama | Port lokal |
| --- | --- | --- | ---: |
| [`frontend/`](frontend/) | Situs RentalKu, pendaftaran calon pengguna, dan panel admin platform | Vue 3, Vite, Pinia | `5173` |
| [`backend/`](backend/) | API autentikasi admin dan pengelolaan subscriber platform | Express, SQLite, JWT | `3000` |
| [`customer-frontend/`](customer-frontend/) | Situs publik dan panel pengelola untuk satu bisnis rental | Vue 3, Vite, Pinia | `5174` |
| [`customer-backend/`](customer-backend/) | API katalog, booking, inventaris, pelanggan, order, dan pengaturan toko | Express, SQLite, JWT | `3001` |

## Alur aplikasi

### Platform RentalKu

`frontend` dan `backend` digunakan oleh pengelola RentalKu. Area publik memperkenalkan layanan dan menerima pendaftaran bisnis rental, sedangkan area admin menyediakan ringkasan serta pengelolaan data subscriber. Endpoint admin dilindungi dengan autentikasi JWT.

### Aplikasi bisnis rental

`customer-frontend` dan `customer-backend` merupakan aplikasi operasional untuk satu bisnis rental, dengan contoh identitas **Summit Gear**.

- Area publik berfokus pada profil bisnis dan katalog alat outdoor.
- Detail produk ditampilkan melalui modal agar pelanggan dapat memeriksa barang tanpa kehilangan konteks.
- Pemesanan memakai alur dua langkah: memilih barang dan jumlah, lalu melengkapi data penyewa serta tanggal sewa.
- Form memiliki validasi per kolom, ringkasan biaya, serta umpan balik error dari API.
- Panel admin mencakup dashboard, inventaris, pelanggan, order, dan pengaturan web.
- Tabel admin mendukung pagination, perataan data sesuai jenisnya, label status berbahasa Indonesia, dan aksi yang jelas.
- Tema terang dan gelap diterapkan konsisten pada konten, header, dan sidebar.

Stok booking diproses secara atomik oleh API. Basis data toko terpisah dari basis data platform agar data operasional tenant tidak bercampur dengan data subscriber RentalKu.

## Menjalankan secara lokal

Gunakan Node.js versi LTS yang kompatibel dengan dependensi proyek. Pada setiap direktori, instal dependensi dan salin `.env.example` menjadi `.env` sebelum menjalankan aplikasi.

Jalankan API platform:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Jalankan frontend platform pada terminal lain:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Jalankan API bisnis rental:

```powershell
cd customer-backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Jalankan frontend bisnis rental pada terminal lain:

```powershell
cd customer-frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Setelah seluruh layanan aktif:

- Platform RentalKu: `http://localhost:5173`
- API platform: `http://localhost:3000`
- Situs bisnis rental: `http://localhost:5174`
- API bisnis rental: `http://localhost:3001`

## Verifikasi

```powershell
cd frontend
npm run build

cd ../customer-frontend
npm run build

cd ../customer-backend
npm test
```

## Dokumentasi lanjutan

- [Frontend platform](frontend/README.md)
- [Backend platform](backend/README.md)
- [Kontrak API platform](backend/docs/api-contract.md)
- [Frontend bisnis rental](customer-frontend/README.md)
- [Backend bisnis rental](customer-backend/README.md)
- [Kontrak API bisnis rental](customer-backend/docs/api-contract.md)

Setiap pasangan frontend dan backend memakai konfigurasi serta basis data masing-masing. Atur `JWT_SECRET`, `CORS_ORIGIN`, alamat API frontend, dan lokasi database sesuai lingkungan sebelum digunakan di produksi.
