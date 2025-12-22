import { useCallback, useEffect, useRef, useState } from "react";

export function useReservationTimer(durationSeconds: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const endAtRef = useRef(Date.now() + durationSeconds * 1000);

  const reset = useCallback(() => {
    endAtRef.current = Date.now() + durationSeconds * 1000;
    setRemainingSeconds(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((endAtRef.current - Date.now()) / 1000)
      );
      setRemainingSeconds(remaining);
    };

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [durationSeconds]);

  return {
    remainingSeconds,
    isExpired: remainingSeconds <= 0,
    reset,
  };
}
