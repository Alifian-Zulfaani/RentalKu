require("./config/env");

const bcrypt = require("bcryptjs");
const db = require("./config/database");

const email = process.env.SEED_ADMIN_EMAIL || "admin@rentalku.com";
const password = process.env.SEED_ADMIN_PASSWORD;

if (!password || password.length < 12) {
  console.error("SEED_ADMIN_PASSWORD minimal 12 karakter wajib diisi untuk membuat admin awal.");
  process.exitCode = 1;
} else {
  const existing = db.prepare("SELECT id FROM admins WHERE email = ? COLLATE NOCASE").get(email);
  if (existing) {
    if (process.argv.includes("--rotate")) {
      db.prepare("UPDATE admins SET password = ? WHERE id = ?").run(
        bcrypt.hashSync(password, 12), existing.id,
      );
      console.log(`Kata sandi admin ${email} diperbarui.`);
    } else {
      console.log("Admin sudah tersedia; tidak ada data yang diubah. Gunakan --rotate untuk mengganti kata sandi.");
    }
  } else {
    db.prepare("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)").run(
      "Administrator",
      email.toLowerCase(),
      bcrypt.hashSync(password, 12),
    );
    console.log(`Admin awal dibuat untuk ${email}.`);
  }
}

db.close();
