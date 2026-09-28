# API Contract Frontend

Dokumen ini mencatat kontrak HTTP yang **sedang dikonsumsi frontend RentalKu**. Gunakan sebagai kompatibilitas minimum saat migrasi backend. Base URL default: `http://localhost:3000/api`.

## Aturan umum

- Semua body menggunakan JSON. Endpoint admin membutuhkan `Authorization: Bearer <jwt>`.
- Kesalahan validasi memakai status `422`: `{ "message": "...", "errors": [{ "field": "email", "message": "..." }] }`.
- Kesalahan lain minimal memiliki `{ "message": "..." }`. Token tidak ada, tidak valid, atau expired memakai `401`.
- Tanggal dikirim sebagai ISO 8601 string. Status subscriber hanya `pending`, `confirmed`, atau `rejected`.

## Endpoint publik

### `POST /public/checkout`

Membuat pendaftaran early access. Tidak membutuhkan token.

| Field | Wajib | Kontrak |
| --- | --- | --- |
| `name` | Ya | string, 2-100 karakter |
| `email` | Ya | email valid |
| `whatsapp` | Ya | nomor Indonesia (`08`, `62`, atau `+62`) |
| `business_name` | Ya | string, 2-100 karakter |
| `business_type` | Ya | string, 2-100 karakter |
| `plan` | Tidak | frontend mengirim `lifetime` |
| `payment_method` | Tidak | frontend mengirim `free` |

Respons sukses `201`:

```json
{
  "message": "Pendaftaran berhasil dan sedang menunggu review.",
  "data": {
    "id": 12,
    "name": "Nama pemilik",
    "email": "nama@bisnis.com",
    "whatsapp": "081234567890",
    "business_name": "Nama Bisnis",
    "subdomain": "nama-bisnis",
    "plan": "lifetime",
    "payment_method": "free",
    "amount": 0,
    "status": "pending",
    "created_at": "2026-09-28T00:00:00.000Z"
  }
}
```

Email yang sudah terdaftar mengembalikan `409`.

## Endpoint autentikasi admin

### `POST /auth/login`

Body: `{ "email": "admin@contoh.com", "password": "..." }`. Respons `200` harus memuat `token` JWT dan `admin` dengan `id`, `name`, serta `email`. Kredensial salah mengembalikan `401`.

```json
{ "message": "Login berhasil", "token": "<jwt>", "admin": { "id": 1, "name": "Admin", "email": "admin@contoh.com" } }
```

## Endpoint subscriber admin

Semua endpoint pada bagian ini membutuhkan JWT admin.

### `GET /subscribers/stats`

Respons `200`:

```json
{
  "totalSubscribers": 12,
  "confirmed": 4,
  "pending": 7,
  "rejected": 1,
  "totalRevenue": 0,
  "recentSubscribers": []
}
```

Setiap item `recentSubscribers` minimal berisi `id`, `name`, `email`, `business_name`, `plan`, `payment_method`, `amount`, `status`, dan `created_at`.

### `GET /subscribers`

Query opsional: `search` (maksimum 100 karakter), `status`, `page` (mulai 1), dan `limit` (1-100). Frontend hanya mengirim `status` ketika ada nilai, bukan string kosong.

Respons `200`:

```json
{
  "data": [{ "id": 12, "name": "Nama", "email": "nama@bisnis.com", "whatsapp": "081234567890", "business_name": "Nama Bisnis", "business_type": "Kendaraan", "subdomain": "nama-bisnis", "plan": "lifetime", "payment_method": "free", "amount": 0, "status": "pending", "confirmed_at": null, "notes": null, "created_at": "2026-09-28T00:00:00.000Z" }],
  "pagination": { "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
}
```

### `PATCH /subscribers/:id/status`

Body: `{ "status": "confirmed" }`. `notes` opsional, maksimal 1000 karakter. Respons `200` minimal memiliki `message`; `404` jika ID tidak ada.

### `DELETE /subscribers/:id`

Menghapus subscriber. Respons `200` minimal memiliki `message`; `404` jika ID tidak ada.

## Endpoint tersedia, belum dipakai frontend

`GET /auth/me` membutuhkan JWT dan mengembalikan `id`, `name`, `email`, serta `created_at`. `GET /health` mengembalikan status layanan tanpa token.
