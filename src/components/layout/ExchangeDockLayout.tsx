"use client";

import type { DockviewApi } from "dockview";
import { DockviewReact, type DockviewReadyEvent, themeDark } from "dockview-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTradingProduct } from "@/context/TradingProductContext";
import { DockPanelTitleSync } from "./DockPanelTitleSync";
import "dockview-react/dist/styles/dockview.css";
import { useDockLayoutControl } from "./DockLayoutControlContext";
import {
  applyDefaultDockLayout,
  clearStoredDockLayout,
  restoreDockLayout,
  saveDockLayout,
} from "./defaultDockLayout";
import {
  applyDefaultPerpDockLayout,
  clearStoredPerpDockLayout,
  restorePerpDockLayout,
  savePerpDockLayout,
} from "./defaultPerpDockLayout";
import { ExchangeDockTab, exchangeDockComponents } from "./exchangeDockComponents";

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const ExchangeDockLayout = () => {
  const product = useTradingProduct();
  const isPerp = product === "perp";
  const { registerResetLayout } = useDockLayoutControl();
  const apiRef = useRef<DockviewApi | null>(null);
  const [dockApi, setDockApi] = useState<DockviewApi | null>(null);
  const persistLayout = useRef(
    debounce(() => {
      if (!apiRef.current) {
        return;
      }
      if (isPerp) {
        savePerpDockLayout(apiRef.current);
      } else {
        saveDockLayout(apiRef.current);
      }
    }, 300)
  ).current;

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      apiRef.current = event.api;
      setDockApi(event.api);

      if (isPerp) {
        restorePerpDockLayout(event.api, () => savePerpDockLayout(event.api));
        event.api.onDidMutateLayout(() => savePerpDockLayout(event.api));
      } else {
        restoreDockLayout(event.api, () => saveDockLayout(event.api));
        event.api.onDidMutateLayout(() => saveDockLayout(event.api));
      }

      event.api.onDidLayoutChange(() => {
        persistLayout();
      });
    },
    [isPerp, persistLayout]
  );

  const resetLayout = useCallback(() => {
    if (!apiRef.current) {
      return;
    }
    if (isPerp) {
      clearStoredPerpDockLayout();
      applyDefaultPerpDockLayout(apiRef.current);
      savePerpDockLayout(apiRef.current);
    } else {
      clearStoredDockLayout();
      applyDefaultDockLayout(apiRef.current, () => {
        if (apiRef.current) {
          saveDockLayout(apiRef.current);
        }
      });
    }
  }, [isPerp]);

  useEffect(() => {
    registerResetLayout(resetLayout);
    return () => registerResetLayout(null);
  }, [registerResetLayout, resetLayout]);

  return (
    <div className="exchange-dock-root flex flex-col min-h-0 flex-1">
      <DockPanelTitleSync api={dockApi} />
      <div className="exchange-dock-host min-h-0 flex-1" data-testid="exchange-dock">
        <DockviewReact
          className="dockview-theme-unifiedx h-full"
          theme={themeDark}
          components={exchangeDockComponents}
          defaultTabComponent={ExchangeDockTab}
          disableFloatingGroups={false}
          onReady={onReady}
        />
      </div>
    </div>
  );
};
