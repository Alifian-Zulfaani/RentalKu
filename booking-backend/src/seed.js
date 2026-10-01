const bcrypt = require("bcryptjs");
const db = require("./db");

const tenant = db.prepare("SELECT id FROM tenants WHERE slug = 'studio'").get();
if (!tenant) {
  db.transaction(() => {
    const studioId = db
      .prepare(
        "INSERT INTO tenants (slug, name, tagline, about, location, whatsapp, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "studio",
        "Studio Senja",
        "Cerita yang tinggal lebih lama dari satu hari.",
        "Studio fotografi untuk potret personal, keluarga, dan momen yang ingin dikenang. Kami bekerja dengan cahaya, ruang, dan waktu yang nyaman bagi Anda.",
        "Yogyakarta, Indonesia",
        "6281234567890",
        "halo@studiosenja.example",
      ).lastInsertRowid;
    db.prepare(
      "INSERT INTO admins (tenant_id, email, password_hash) VALUES (?, ?, ?)",
    ).run(
      studioId,
      "admin@studiosenja.example",
      bcrypt.hashSync("admin123", 10),
    );
    const insertPro = db.prepare(
      "INSERT INTO professionals (tenant_id, slug, name, title, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const naya = insertPro.run(
      studioId,
      "naya",
      "Naya Putri",
      "Portrait & family photographer",
      "Saya memotret hubungan yang terasa nyata: percakapan kecil, gestur spontan, dan cahaya yang datang apa adanya.",
      "/images/naya-portrait.png",
    ).lastInsertRowid;
    const arya = insertPro.run(
      studioId,
      "arya",
      "Arya Mahendra",
      "Wedding & event photographer",
      "Merekam perayaan dengan pendekatan dokumenter yang hangat, tenang, dan tidak berlebihan.",
      "/images/arya-portrait.png",
    ).lastInsertRowid;
    const addHours = db.prepare(
      "INSERT INTO working_hours (professional_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)",
    );
    for (const pro of [naya, arya])
      for (const day of [1, 2, 3, 4, 5, 6])
        addHours.run(pro, day, "09:00", "17:00");
    const addService = db.prepare(
      "INSERT INTO services (tenant_id, name, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?)",
    );
    addService.run(
      studioId,
      "Portrait personal",
      "Sesi santai dengan arahan yang natural, cocok untuk profil dan dokumentasi diri.",
      60,
      450000,
    );
    addService.run(
      studioId,
      "Cerita keluarga",
      "Waktu bersama keluarga di studio atau lokasi pilihan Anda.",
      120,
      850000,
    );
    addService.run(
      studioId,
      "Prewedding intimate",
      "Sesi dua jam untuk cerita berdua yang dekat dan jujur.",
      120,
      1500000,
    );
    db.prepare(
      `INSERT INTO professional_services (professional_id, service_id, price)
      SELECT p.id, s.id, CASE
        WHEN p.slug = 'arya' THEN ROUND(s.price * 1.3 / 50000) * 50000
        ELSE s.price END
      FROM professionals p JOIN services s ON s.tenant_id = p.tenant_id
      WHERE p.tenant_id = ?`,
    ).run(studioId);
    const addPhotographerAdmin = db.prepare(
      "INSERT INTO admins (tenant_id, email, password_hash, role, professional_id) VALUES (?, ?, ?, 'photographer', ?)",
    );
    addPhotographerAdmin.run(
      studioId,
      "naya@studiosenja.example",
      bcrypt.hashSync("naya123", 10),
      naya,
    );
    addPhotographerAdmin.run(
      studioId,
      "arya@studiosenja.example",
      bcrypt.hashSync("arya123", 10),
      arya,
    );
  })();
  console.log(
    "Studio Senja dibuat. Admin: admin@studiosenja.example / admin123 (ubah sebelum produksi)",
  );
} else {
  const updatePhoto = db.prepare(
    "UPDATE professionals SET photo_url = ? WHERE tenant_id = ? AND slug = ? AND photo_url = ''",
  );
  updatePhoto.run("/images/naya-portrait.png", tenant.id, "naya");
  updatePhoto.run("/images/arya-portrait.png", tenant.id, "arya");
  const photographerAccounts = db
    .prepare(
      "SELECT COUNT(*) AS count FROM admins WHERE tenant_id = ? AND role = 'photographer'",
    )
    .get(tenant.id).count;
  if (!photographerAccounts) {
    const person = db
      .prepare("SELECT id, slug FROM professionals WHERE tenant_id = ?")
      .all(tenant.id);
    const insert = db.prepare(
      "INSERT OR IGNORE INTO admins (tenant_id, email, password_hash, role, professional_id) VALUES (?, ?, ?, 'photographer', ?)",
    );
    for (const item of person.filter((entry) =>
      ["naya", "arya"].includes(entry.slug),
    )) {
      insert.run(
        tenant.id,
        `${item.slug}@studiosenja.example`,
        bcrypt.hashSync(`${item.slug}123`, 10),
        item.id,
      );
    }
    db.prepare(
      `UPDATE professional_services SET price = ROUND(price * 1.3 / 50000) * 50000
      WHERE professional_id IN (SELECT id FROM professionals WHERE tenant_id = ? AND slug = 'arya')`,
    ).run(tenant.id);
  }
  console.log("Data contoh Studio Senja sudah ada.");
}
const profileCopy = db.prepare(
  "UPDATE professionals SET headline = CASE WHEN headline = '' THEN ? ELSE headline END, approach = CASE WHEN approach = '' THEN ? ELSE approach END WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'studio') AND slug = ?",
);
profileCopy.run(
  "Potret yang terasa seperti pulang.",
  "Saya memberi ruang untuk gerak, tawa, dan jeda yang alami. Setiap sesi dirancang supaya Anda nyaman menjadi diri sendiri di depan kamera.",
  "naya",
);
profileCopy.run(
  "Perayaan, apa adanya.",
  "Saya mendokumentasikan peristiwa tanpa mengubah ritmenya: detail kecil, ekspresi jujur, dan hubungan yang tak perlu diarahkan berlebihan.",
  "arya",
);
