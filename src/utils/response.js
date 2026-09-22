/**
 * Standard API Success Response Helper
 * @param {import('express').Response} res 
 * @param {any} data 
 * @param {string} message 
 * @param {number} statusCode 
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard API Error Response Helper
 * @param {import('express').Response} res 
 * @param {string} message 
 * @param {number} statusCode 
 * @param {any} errors 
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const responseContent = {
    success: false,
    message,
    data: null,
  };

  if (errors) {
    responseContent.errors = errors;
  }

  return res.status(statusCode).json(responseContent);
};

module.exports = {
  successResponse,
  errorResponse,
};
