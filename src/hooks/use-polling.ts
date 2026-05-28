"use client";

import { useEffect, useRef, useCallback } from "react";

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const tick = useCallback(() => {
    if (enabled) {
      const result = savedCallback.current();
      if (result instanceof Promise) {
        result.catch(console.error);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    tick();

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs, enabled]);
}
