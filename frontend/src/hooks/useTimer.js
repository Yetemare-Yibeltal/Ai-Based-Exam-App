import { useState, useEffect, useRef, useCallback } from "react";

const useTimer = (initialTime = 0, onTimeUp = null, autoStart = false) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (onTimeUpRef.current) onTimeUpRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(
    (newTime = initialTime) => {
      stop();
      setTimeLeft(newTime);
    },
    [stop, initialTime],
  );

  const restart = useCallback(
    (newTime = initialTime) => {
      reset(newTime);
      setIsRunning(true);
      setIsPaused(false);
    },
    [reset, initialTime],
  );

  const formatTime = useCallback(
    (seconds = timeLeft) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
    [timeLeft],
  );

  const getPercentage = useCallback(() => {
    if (!initialTime) return 0;
    return Math.round((timeLeft / initialTime) * 100);
  }, [timeLeft, initialTime]);

  const isLow = timeLeft <= Math.floor(initialTime * 0.2);
  const isCritical = timeLeft <= 10;

  return {
    timeLeft,
    isRunning,
    isPaused,
    isLow,
    isCritical,
    formattedTime: formatTime(),
    percentage: getPercentage(),
    start,
    pause,
    resume,
    stop,
    reset,
    restart,
    formatTime,
  };
};

export default useTimer;
