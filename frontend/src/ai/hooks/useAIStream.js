import { useState, useCallback, useRef } from "react";

const useAIStream = () => {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const startStream = useCallback(async (streamFn) => {
    setIsStreaming(true);
    setStreamedText("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamFn(
        (chunk) => setStreamedText((prev) => prev + chunk),
        () => setIsStreaming(false),
        (err) => {
          setError(err.message);
          setIsStreaming(false);
        },
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Stream failed");
      }
      setIsStreaming(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setStreamedText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    streamedText,
    isStreaming,
    error,
    startStream,
    stopStream,
    reset,
  };
};

export default useAIStream;
