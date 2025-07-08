import { useEffect, useRef, useState } from "react";

export const useBaseWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    setHeight(widgetRef?.current?.clientHeight || 0);
    setHeaderHeight(headerRef?.current?.clientHeight || 0);
  }, [setHeight, setHeaderHeight]);

  return {
    widgetRef,
    height,
    headerRef,
    headerHeight,
  };
};
