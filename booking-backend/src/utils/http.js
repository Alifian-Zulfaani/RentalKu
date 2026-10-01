function apiError(status, message, field) {
  const issue = new Error(message);
  issue.status = status;
  if (field) issue.errors = [{ field, message }];
  throw issue;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    try {
      Promise.resolve(handler(req, res)).catch(next);
    } catch (error) {
      next(error);
    }
  };
}

function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
}

function errorHandler(error, _req, res, _next) {
  if (error.code === "SQLITE_CONSTRAINT_UNIQUE")
    return res.status(409).json({ message: "Slug atau email sudah digunakan" });
  if (!error.status || error.status >= 500)
    console.error("[booking-api]", error);
  res.status(error.status || 500).json({
    message: error.status ? error.message : "Terjadi kesalahan pada server",
    ...(error.errors && { errors: error.errors }),
  });
}

module.exports = { apiError, asyncHandler, errorHandler, notFoundHandler };
