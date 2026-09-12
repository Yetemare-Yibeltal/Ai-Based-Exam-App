import { useState, useEffect, useCallback, useRef } from "react";

const useFetch = (fetchFn, options = {}) => {
  const {
    immediate = true,
    deps = [],
    onSuccess = null,
    onError = null,
    initialData = null,
    transform = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFn(...args);
        const responseData =
          result?.data?.data !== undefined
            ? result.data.data
            : result?.data || result;

        const finalData = transform ? transform(responseData) : responseData;

        if (isMountedRef.current) {
          setData(finalData);
          setIsLoading(false);
          if (onSuccess) onSuccess(finalData);
        }

        return { success: true, data: finalData };
      } catch (err) {
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return { success: false, cancelled: true };
        }

        const message =
          err.response?.data?.message || err.message || "An error occurred";

        if (isMountedRef.current) {
          setError(message);
          setIsLoading(false);
          if (onError) onError(message);
        }

        return { success: false, error: message };
      }
    },
    [fetchFn, onSuccess, onError, transform],
  );

  const refetch = useCallback(
    async (...args) => {
      setIsRefetching(true);
      const result = await execute(...args);
      if (isMountedRef.current) setIsRefetching(false);
      return result;
    },
    [execute],
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, deps);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  return {
    data,
    isLoading,
    isRefetching,
    error,
    execute,
    refetch,
    reset,
    setData,
  };
};

export default useFetch;
