"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DockLayoutControlContextValue = {
  canResetLayout: boolean;
  resetLayout: () => void;
  registerResetLayout: (handler: (() => void) | null) => void;
};

const DockLayoutControlContext =
  createContext<DockLayoutControlContextValue | null>(null);

export function DockLayoutControlProvider({ children }: { children: ReactNode }) {
  const resetHandlerRef = useRef<(() => void) | null>(null);
  const [canResetLayout, setCanResetLayout] = useState(false);

  const registerResetLayout = useCallback((handler: (() => void) | null) => {
    resetHandlerRef.current = handler;
    setCanResetLayout(handler !== null);
  }, []);

  const resetLayout = useCallback(() => {
    resetHandlerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({ canResetLayout, resetLayout, registerResetLayout }),
    [canResetLayout, resetLayout, registerResetLayout]
  );

  return (
    <DockLayoutControlContext.Provider value={value}>
      {children}
    </DockLayoutControlContext.Provider>
  );
}

export function useDockLayoutControl() {
  const ctx = useContext(DockLayoutControlContext);
  if (!ctx) {
    throw new Error(
      "useDockLayoutControl must be used within DockLayoutControlProvider"
    );
  }
  return ctx;
}

/** Safe on pages without a dock (e.g. home). */
export function useOptionalDockLayoutControl() {
  return useContext(DockLayoutControlContext);
}
