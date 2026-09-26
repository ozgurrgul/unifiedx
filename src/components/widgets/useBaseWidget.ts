import { useEffect, useRef, useState } from "react";

export const useBaseWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const widgetEl = widgetRef.current;
    const headerEl = headerRef.current;
    if (!widgetEl) {
      return;
    }

    const measure = () => {
      setHeight(widgetEl.clientHeight || 0);
      setHeaderHeight(headerEl?.clientHeight || 0);
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(widgetEl);
    if (headerEl) {
      observer.observe(headerEl);
    }

    return () => observer.disconnect();
  }, []);

  return {
    widgetRef,
    height,
    headerRef,
    headerHeight,
  };
};
