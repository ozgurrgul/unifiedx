"use client";

import type { DockviewApi } from "dockview";
import { useContext, useEffect } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { DOCK_PANEL_IDS } from "./defaultDockLayout";

export function DockPanelTitleSync({ api }: { api: DockviewApi | null }) {
  const {
    getters: {
      activeSpotMarket: { base },
    },
  } = useContext(ExchangeDataGettersContext);

  useEffect(() => {
    if (!api) {
      return;
    }
    const symbol = base?.symbol ?? "—";
    api.getPanel(DOCK_PANEL_IDS.baseOpenOrders)?.api.setTitle(`${symbol} open orders`);
    api.getPanel(DOCK_PANEL_IDS.orderHistory)?.api.setTitle(`${symbol} order history`);
  }, [api, base?.symbol]);

  return null;
}
