import { useCallback } from "react";
import toast from "react-hot-toast";

const useToast = () => {
  const success = useCallback((message, options = {}) => {
    toast.success(message, { duration: 4000, ...options });
  }, []);

  const error = useCallback((message, options = {}) => {
    toast.error(message, { duration: 5000, ...options });
  }, []);

  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, options);
  }, []);

  const info = useCallback((message, options = {}) => {
    toast(message, {
      icon: "ℹ️",
      duration: 4000,
      style: { background: "#1e40af", color: "#fff" },
      ...options,
    });
  }, []);

  const warning = useCallback((message, options = {}) => {
    toast(message, {
      icon: "⚠️",
      duration: 4000,
      style: { background: "#d97706", color: "#fff" },
      ...options,
    });
  }, []);

  const promise = useCallback((promise, messages = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || "Loading...",
      success: messages.success || "Success!",
      error: messages.error || "Something went wrong",
    });
  }, []);

  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  const update = useCallback((toastId, options = {}) => {
    toast(options.message || "", { id: toastId, ...options });
  }, []);

  const apiError = useCallback((error) => {
    const message =
      error?.response?.data?.message || error?.message || "An error occurred";
    toast.error(message, { duration: 5000 });
  }, []);

  return {
    success,
    error,
    loading,
    info,
    warning,
    promise,
    dismiss,
    dismissAll,
    update,
    apiError,
  };
};

export default useToast;
