# Kontrak API platform RentalKu

## Aturan umum

Base URL lokal: `http://localhost:3000/api`. Request dengan body memakai JSON. Endpoint admin membutuhkan `Authorization: Bearer <token>`.

Respons sukses memuat `data`; `message` ditambahkan untuk tindakan yang perlu dikonfirmasi. Daftar berpaginasi memakai `meta.pagination`. Penghapusan berhasil mengembalikan `204 No Content` tanpa body. Tanggal respons menggunakan ISO 8601 UTC.

Respons gagal memakai [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) dengan `Content-Type: application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Periksa kembali data yang diisi.",
  "instance": "/api/public/checkout",
  "errors": [{ "field": "email", "message": "Email tidak valid" }]
}
```

`errors` hanya ada pada kesalahan field. Status yang dipakai: `400` JSON rusak, `401` autentikasi, `403` CORS, `404` tidak ditemukan, `409` pendaftaran ganda, `413` body terlalu besar, `422` validasi, dan `500` gangguan layanan. Detail kesalahan internal tidak dikirim ke klien.

## Endpoint publik

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/health` | Status layanan; respons `{ "data": { "status": "ok" } }` |
| `POST` | `/public/checkout` | Mendaftarkan bisnis untuk early access gratis |

Body `POST /public/checkout` wajib memuat `name` (2–100 karakter), `email`, `whatsapp` (nomor Indonesia), `business_name` (2–100), `business_type` (2–100), dan `product_type` (`rental` atau `booking`). Klien tidak menentukan `plan`, `payment_method`, atau `amount`; server menetapkan `early_access`, `null`, dan `0`.

Respons `201`:

```json
{
  "message": "Pendaftaran diterima. Tim kami akan meninjaunya terlebih dahulu.",
  "data": {
    "id": 1,
    "name": "Ayu Lestari",
    "email": "ayu@example.com",
    "whatsapp": "081234567890",
    "business_name": "Studio Ayu",
    "business_type": "Fotografi",
    "product_type": "booking",
    "subdomain": "studio-ayu",
    "plan": "early_access",
    "payment_method": null,
    "amount": 0,
    "status": "pending",
    "created_at": "2026-10-01T02:00:00.000Z"
  }
}
```

Satu email boleh mendaftar sekali pada masing-masing produk. Pendaftaran kedua pada produk yang sama mengembalikan `409` dengan `errors[0].field = "email"`.

## Autentikasi admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/auth/login` | Masuk dengan `email` dan `password`; respons memuat `data.token` (JWT) dan `data.admin` |
| `GET` | `/auth/me` | Identitas admin (`id`, `name`, `email`, `created_at`) di dalam `data` |

Contoh respons login `200`:

```json
{
  "message": "Berhasil masuk.",
  "data": {
    "token": "<jwt>",
    "admin": { "id": 1, "name": "Admin", "email": "admin@example.com" }
  }
}
```

## Endpoint admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/subscribers` | Daftar pendaftar berpaginasi |
| `GET` | `/subscribers/stats` | Statistik dan lima pendaftar terbaru |
| `GET` | `/subscribers/:id` | Detail pendaftar |
| `PATCH` | `/subscribers/:id/status` | Ubah status dan catatan |
| `DELETE` | `/subscribers/:id` | Hapus pendaftar; sukses `204` tanpa body |

`GET /subscribers` menerima query opsional `search` (maksimal 100 karakter, teks literal), `status`, `product_type`, `page` (mulai 1), dan `limit` (1–100; default 10). Respons `200`:

```json
{
  "data": [],
  "meta": {
    "pagination": { "total": 0, "page": 1, "limit": 10, "totalPages": 1 }
  }
}
```

`GET /subscribers/stats` mengembalikan `data` berisi `totalSubscribers`, `confirmed`, `pending`, `rejected`, `recentSubscribers`, dan `byProduct.rental`/`byProduct.booking` (`total`, `pending`, `confirmed`). Pada daftar kosong, semua hitungan bernilai `0`, bukan `null`.

`GET /subscribers/:id` mengembalikan `{ "data": <subscriber> }`. Body `PATCH /subscribers/:id/status` berisi `status` (`pending`, `confirmed`, atau `rejected`) dan `notes` opsional (maksimal 1000 karakter); respons `200` mengembalikan `message` dan `data` pendaftar setelah perubahan. ID yang tidak ditemukan mengembalikan `404`.

Data pendaftar memuat `id`, `name`, `email`, `whatsapp`, `business_name`, `business_type`, `product_type`, `subdomain`, `plan`, `payment_method`, `amount`, `status`, `confirmed_at`, `notes`, dan `created_at` sesuai konteks endpoint.

## Status dan aturan bisnis

| Status internal | Label UI | Arti |
| --- | --- | --- |
| `pending` | Menunggu | Pendaftaran perlu ditinjau |
| `confirmed` | Disetujui | Pendaftaran disetujui admin |
| `rejected` | Ditolak | Pendaftaran ditolak admin |

Status `confirmed` **bukan** bukti tenant, akun, atau subdomain aplikasi Rental/Booking sudah diprovisikan. Proses tersebut masih terpisah dari API platform.
