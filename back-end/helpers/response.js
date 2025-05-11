// backend/helpers/response.js
const successResponse = (res, message, data = null, count = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (count !== null) response.count = count;
  res.status(200).json(response);
};

const errorResponse = (res, message, details = null, statusCode = 500) => {
  const response = { success: false, message };
  if (details) response.details = details;
  res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};