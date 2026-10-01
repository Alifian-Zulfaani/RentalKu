const db = require("../config/database");
const { apiError } = require("../utils/http");

function tenantBySlug(slug) {
  if (typeof slug !== "string" || !slug.trim())
    apiError(422, "Pilih studio terlebih dahulu", "tenant");
  const tenant = db.prepare("SELECT * FROM tenants WHERE slug = ?").get(slug);
  if (!tenant) apiError(404, "Bisnis tidak ditemukan");
  return tenant;
}

function professionalFor(tenantId, slug) {
  if (typeof slug !== "string" || !slug.trim())
    apiError(422, "Pilih fotografer terlebih dahulu", "pro");
  const professional = db
    .prepare(
      "SELECT * FROM professionals WHERE tenant_id = ? AND slug = ? AND active = 1",
    )
    .get(tenantId, slug);
  if (!professional) apiError(404, "Fotografer tidak ditemukan");
  return professional;
}

function serviceFor(tenantId, id) {
  if (!Number.isInteger(id) || id < 1)
    apiError(422, "Pilih layanan terlebih dahulu", "service_id");
  const service = db
    .prepare(
      "SELECT * FROM services WHERE tenant_id = ? AND id = ? AND active = 1",
    )
    .get(tenantId, id);
  if (!service) apiError(404, "Layanan tidak ditemukan");
  return service;
}

function offeringFor(professionalId, serviceId) {
  const offering = db
    .prepare(
      "SELECT price FROM professional_services WHERE professional_id = ? AND service_id = ? AND active = 1",
    )
    .get(professionalId, serviceId);
  if (!offering) apiError(404, "Layanan tidak tersedia untuk fotografer ini");
  return offering;
}

module.exports = { offeringFor, professionalFor, serviceFor, tenantBySlug };
