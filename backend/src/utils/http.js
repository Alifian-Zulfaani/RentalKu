const { validationResult } = require("express-validator");
const { STATUS_CODES } = require("node:http");

function sendProblem(req, res, status, detail, errors) {
  const problem = {
    type: "about:blank",
    title: STATUS_CODES[status],
    status,
    detail,
    instance: req.path,
  };
  if (errors?.length) problem.errors = errors;
  return res.status(status).type("application/problem+json").json(problem);
}

function sendServerError(req, res, context, error) {
  logServerError(context, error);
  return sendProblem(req, res, 500, "Layanan sedang mengalami gangguan. Coba lagi nanti.");
}

function sendValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendProblem(req, res, 422, "Periksa kembali data yang diisi.",
      errors.array().map(({ path, msg }) => ({ field: path, message: msg })));
  }

  next();
}

function logServerError(context, error) {
  console.error(`[${context}]`, error);
}

module.exports = { sendProblem, sendServerError, sendValidationErrors, logServerError };
