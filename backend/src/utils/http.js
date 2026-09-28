const { validationResult } = require("express-validator");

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

function logServerError(context, error) {
  console.error(`[${context}]`, error);
}

module.exports = { sendValidationErrors, logServerError };
