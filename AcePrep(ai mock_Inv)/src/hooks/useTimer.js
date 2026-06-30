import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Countdown timer that ticks every second.
 * @param {number} initialSeconds - starting duration
 * @param {() => void} onExpire - called when timer reaches 0
 * @param {(remaining:number)=>void} onTick - called every second with remaining time
 */
const useTimer = (initialSeconds, onExpire, onTick) => {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const targetRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onExpireRef.current = onExpire;
    onTickRef.current = onTick;
  });

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const start = useCallback(
    (seconds) => {
      console.log('[useTimer] start() called with', seconds);
      stop();
      const total = seconds ?? initialSeconds;
      targetRef.current = Date.now() + total * 1000;
      setTimeRemaining(total);
      setRunning(true);

      const tick = () => {
        const remainingMs = targetRef.current - Date.now();
        const remaining = Math.max(0, Math.round(remainingMs / 1000));
        console.log('[useTimer] tick', remaining);
        setTimeRemaining(remaining);
        if (onTickRef.current) onTickRef.current(remaining);

        if (remaining <= 0) {
          stop();
          if (onExpireRef.current) onExpireRef.current();
        }
      };

      // Run immediately so first tick is instant
      tick();
      intervalRef.current = setInterval(tick, 1000);
      console.log('[useTimer] interval set', intervalRef.current);
    },
    [initialSeconds, stop]
  );

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(
    (seconds) => {
      stop();
      const total = seconds ?? initialSeconds;
      setTimeRemaining(total);
      targetRef.current = null;
      if (onTickRef.current) onTickRef.current(total);
    },
    [initialSeconds, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    timeRemaining,
    running,
    start,
    pause,
    reset,
  };
};

export default useTimer;
