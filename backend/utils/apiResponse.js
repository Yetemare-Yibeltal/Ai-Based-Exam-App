const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNextPage:
        pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
  });
};

const createdResponse = (res, message, data) => {
  return successResponse(res, message, data, 201);
};

const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, message, 404);
};

const unauthorizedResponse = (res, message = "Unauthorized access") => {
  return errorResponse(res, message, 401);
};

const forbiddenResponse = (res, message = "Forbidden access") => {
  return errorResponse(res, message, 403);
};

const validationErrorResponse = (res, errors) => {
  return errorResponse(res, "Validation failed", 422, errors);
};

const conflictResponse = (res, message = "Resource already exists") => {
  return errorResponse(res, message, 409);
};

const badRequestResponse = (res, message = "Bad request") => {
  return errorResponse(res, message, 400);
};

const serverErrorResponse = (res, message = "Internal server error") => {
  return errorResponse(res, message, 500);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  conflictResponse,
  badRequestResponse,
  serverErrorResponse,
};
