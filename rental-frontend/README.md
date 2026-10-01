# Summit Gear Rental Frontend

Frontend publik dan panel admin untuk aplikasi rental perlengkapan outdoor. Dibangun dengan Vue 3, Vite, Pinia, Vue Router, Axios, dan Lucide Icons.

## Fitur

- Beranda profil perusahaan dan katalog produk.
- Detail produk dalam modal.
- Booking dua langkah: pilih barang dan jumlah, lalu isi data penyewa.
- Validasi per input, estimasi harga, serta notifikasi sukses/error.
- Panel admin untuk dashboard, inventaris, pelanggan, order, dan pengaturan website.
- Tema terang/gelap, tabel responsif, pagination, dan aksi admin berlabel.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5174` dan secara default memakai API `http://localhost:3001/api`.

Salin `.env.example` menjadi `.env` bila alamat API atau URL publik perlu diubah.

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SITE_URL=https://summitgear.example
VITE_PLATFORM_URL=http://localhost:5173
```

## Verifikasi

```bash
npm run build
```

Halaman publik tersedia di `/` dan `/sewa`. Panel admin tersedia di `/admin/login`.
