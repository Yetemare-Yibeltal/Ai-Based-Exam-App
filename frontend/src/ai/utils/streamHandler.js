export const createStreamReader = async (
  response,
  onChunk,
  onComplete,
  onError,
) => {
  if (!response.body) {
    onError(new Error("Response body is not readable"));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.delta?.text || parsed.content?.[0]?.text || "";
            if (text) onChunk(text);
          } catch {
            continue;
          }
        }
      }
    }
    onComplete();
  } catch (error) {
    onError(error);
  } finally {
    reader.releaseLock();
  }
};

export const accumulateStream = async (streamFn) => {
  let fullText = "";
  return new Promise((resolve, reject) => {
    streamFn(
      (chunk) => {
        fullText += chunk;
      },
      () => resolve(fullText),
      reject,
    );
  });
};

export const createSSEListener = (url, handlers, token) => {
  const eventSource = new EventSource(`${url}?token=${token}`);

  eventSource.onmessage = (e) => {
    if (e.data === "[DONE]") {
      handlers.onComplete?.();
      eventSource.close();
      return;
    }
    try {
      const data = JSON.parse(e.data);
      handlers.onChunk?.(data);
    } catch {}
  };

  eventSource.onerror = (error) => {
    handlers.onError?.(error);
    eventSource.close();
  };

  return () => eventSource.close();
};
