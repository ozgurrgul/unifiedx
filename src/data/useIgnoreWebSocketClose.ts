import { useEffect, useRef } from "react";

/** Avoid surfacing "Websocket closed" errors during unmount or explicit disconnect. */
export const useIgnoreWebSocketClose = () => {
  const ignoreRef = useRef(false);

  useEffect(() => {
    return () => {
      ignoreRef.current = true;
    };
  }, []);

  const markClosing = () => {
    ignoreRef.current = true;
  };

  const shouldIgnoreClose = () => ignoreRef.current;

  return { markClosing, shouldIgnoreClose };
};
