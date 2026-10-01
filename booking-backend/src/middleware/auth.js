const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { apiError } = require("../utils/http");

function authMiddleware(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /i, "");
    if (!token) apiError(401, "Silakan masuk sebagai admin");
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-only-change-me",
    );
    const account = db
      .prepare(
        "SELECT id, tenant_id, role, professional_id, email FROM admins WHERE id = ?",
      )
      .get(payload.adminId);
    if (!account || account.tenant_id !== payload.tenantId)
      apiError(401, "Sesi tidak valid");
    req.account = account;
    req.tenantId = account.tenant_id;
    req.professionalId =
      account.role === "photographer" ? account.professional_id : null;
    if (account.role === "photographer" && !account.professional_id)
      apiError(401, "Akun fotografer belum terhubung");
    next();
  } catch (_error) {
    next(Object.assign(new Error("Sesi tidak valid"), { status: 401 }));
  }
}

function companyOnly(req, _res, next) {
  if (req.account.role !== "company")
    return next(
      Object.assign(
        new Error("Hanya admin studio yang dapat mengakses menu ini"),
        { status: 403 },
      ),
    );
  next();
}

function assertProfessionalAccess(req, id) {
  if (req.professionalId && Number(id) !== req.professionalId)
    apiError(403, "Anda hanya dapat mengelola data sendiri");
}

module.exports = { assertProfessionalAccess, authMiddleware, companyOnly };
