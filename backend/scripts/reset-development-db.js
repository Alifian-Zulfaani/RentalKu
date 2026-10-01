require("../src/config/env");

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Reset database production tidak diizinkan.");
  }
  if (process.env.DB_PATH || !process.argv.includes("--confirm")) {
    throw new Error("Jalankan tanpa DB_PATH dengan --confirm untuk mereset database lokal.");
  }

  const databasePath = path.resolve(__dirname, "..", "database.sqlite");
  if (!fs.existsSync(databasePath)) {
    throw new Error(`Database lokal tidak ditemukan: ${databasePath}`);
  }

  const backupDirectory = path.resolve(__dirname, "..", ".local-backups");
  fs.mkdirSync(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDirectory, `platform-before-reset-${stamp}.sqlite`);
  const db = new Database(databasePath);

  try {
    const count = db.prepare("SELECT COUNT(*) AS total FROM subscribers").get().total;
    const admins = db.prepare("SELECT COUNT(*) AS total FROM admins").get().total;
    await db.backup(backupPath);
    db.pragma("secure_delete = ON");
    db.transaction(() => {
      db.prepare("DELETE FROM subscribers").run();
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'subscribers'").run();
    })();
    db.exec("VACUUM");
    db.pragma("wal_checkpoint(TRUNCATE)");
    console.log(`Backup: ${backupPath}`);
    console.log(`Pendaftar dihapus: ${count}; akun admin dipertahankan: ${admins}`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
