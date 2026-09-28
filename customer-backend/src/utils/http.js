const { validationResult } = require("express-validator");

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function sendValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Data yang dikirim belum valid",
      errors: errors
        .array()
        .map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }

  next();
}

function getPagination(query, defaultLimit = 10) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || defaultLimit;

  return { page, limit, offset: (page - 1) * limit };
}

function sendServerError(res, context, error) {
  console.error(`[${context}]`, error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: "Terjadi kesalahan pada server" });
}

module.exports = {
  ApiError,
  getPagination,
  sendServerError,
  sendValidationErrors,
};
