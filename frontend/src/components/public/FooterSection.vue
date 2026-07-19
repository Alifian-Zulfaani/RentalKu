<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="brand-text"
              >Rental<span class="text-gradient">Ku</span></span
            >
          </div>
          <p>
            Platform manajemen rental terlengkap untuk UMKM Indonesia. Kelola
            bisnis rental dengan mudah dan efisien.
          </p>
        </div>
        <div class="footer-links">
          <h4>Fitur</h4>
          <a href="#fitur">Kelola Order</a>
          <a href="#fitur">CRM Pelanggan</a>
          <a href="#fitur">Inventaris</a>
          <a href="#fitur">Laporan</a>
        </div>
        <div class="footer-links">
          <h4>Kontak</h4>
          <a href="https://wa.me/6281234567890" target="_blank"
            >WhatsApp Support</a
          >
          <a href="mailto:hello@rentalku.com">hello@rentalku.com</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 RentalKu. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 60px 0 0;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 40px;
}
.footer-brand p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 16px;
  line-height: 1.7;
  max-width: 360px;
}
.brand-text {
  font-size: 1.5rem;
  font-weight: 800;
}
.footer-links h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}
.footer-links a {
  display: block;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 6px 0;
  transition: color 0.3s;
}
.footer-links a:hover {
  color: var(--text-accent);
}
.footer-bottom {
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  text-align: center;
}
.footer-bottom p {
  font-size: 0.85rem;
  color: var(--text-muted);
}
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
