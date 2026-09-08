import toast from "react-hot-toast";

export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred";
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    const firstError = error.response.data.errors[0];
    return firstError?.message || "Validation error occurred";
  }
  if (error.message) return error.message;
  return "An unexpected error occurred";
};

export const getStatusCode = (error) => {
  return error?.response?.status || 500;
};

export const isUnauthorized = (error) => getStatusCode(error) === 401;
export const isForbidden = (error) => getStatusCode(error) === 403;
export const isNotFound = (error) => getStatusCode(error) === 404;
export const isServerError = (error) => getStatusCode(error) >= 500;
export const isRateLimited = (error) => getStatusCode(error) === 429;
export const isNetworkError = (error) => !error.response && error.request;

export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);

  if (isNetworkError(error)) {
    toast.error("Network error. Please check your internet connection.");
    return;
  }

  if (isRateLimited(error)) {
    toast.error("Too many requests. Please slow down and try again.");
    return;
  }

  if (isServerError(error)) {
    toast.error("Server error. Please try again later.");
    return;
  }

  toast.error(message);
};

export const handleValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return {};
  return errors.reduce((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {});
};

export const logError = (error, context = "") => {
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, error);
  }
};

export const createErrorBoundaryMessage = (error) => ({
  title: "Something went wrong",
  message: import.meta.env.DEV
    ? error?.message
    : "Please refresh the page and try again.",
  action: "Refresh Page",
});
