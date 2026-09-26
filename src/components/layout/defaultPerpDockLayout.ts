import type { DockviewApi, SerializedDockview } from "dockview";
import {
  DOCK_PANEL_IDS,
  DOCK_SIDE_COLUMN_WIDTH,
  queueDefaultColumnWidths,
} from "./defaultDockLayout";

export const PERP_DOCK_LAYOUT_STORAGE_KEY = "unifiedx-dock-layout-perp-v4";

const PERP_PANEL_IDS = [
  DOCK_PANEL_IDS.orderBook,
  DOCK_PANEL_IDS.chart,
  DOCK_PANEL_IDS.markets,
  DOCK_PANEL_IDS.trades,
  DOCK_PANEL_IDS.marketOrder,
] as const;

const PERP_COMPONENTS = [
  "orderBook",
  "candlestickChart",
  "markets",
  "trades",
  "marketOrderForm",
] as const;

function isPerpLayoutValid(data: unknown): data is SerializedDockview {
  if (!data || typeof data !== "object") {
    return false;
  }
  const layout = data as SerializedDockview;
  if (!layout.panels || !layout.grid?.root) {
    return false;
  }
  for (const panelId of PERP_PANEL_IDS) {
    const panel = layout.panels[panelId];
    const component = panel?.contentComponent;
    if (!component || !PERP_COMPONENTS.includes(component as (typeof PERP_COMPONENTS)[number])) {
      return false;
    }
  }
  return true;
}

export function applyDefaultPerpDockLayout(
  api: DockviewApi,
  onColumnWidthsApplied?: () => void
): void {
  api.clear();

  const orderBook = api.addPanel({
    id: DOCK_PANEL_IDS.orderBook,
    component: "orderBook",
    title: "Order Book",
    initialWidth: DOCK_SIDE_COLUMN_WIDTH,
  });

  const chart = api.addPanel({
    id: DOCK_PANEL_IDS.chart,
    component: "candlestickChart",
    title: "Chart",
    position: { direction: "right", referencePanel: orderBook },
  });

  const markets = api.addPanel({
    id: DOCK_PANEL_IDS.markets,
    component: "markets",
    title: "Markets",
    position: { direction: "right", referencePanel: chart },
    initialWidth: DOCK_SIDE_COLUMN_WIDTH,
  });

  api.addPanel({
    id: DOCK_PANEL_IDS.trades,
    component: "trades",
    title: "Trades",
    position: { direction: "within", referencePanel: markets },
  });

  api.getPanel(DOCK_PANEL_IDS.markets)?.api.setActive();

  api.addPanel({
    id: DOCK_PANEL_IDS.marketOrder,
    component: "marketOrderForm",
    title: "Market",
    position: { direction: "below", referencePanel: chart },
    initialHeight: 280,
  });

  queueDefaultColumnWidths(api, onColumnWidthsApplied);
}

function loadStoredPerpLayout(): SerializedDockview | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(PERP_DOCK_LAYOUT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SerializedDockview) : null;
  } catch {
    return null;
  }
}

export function savePerpDockLayout(api: DockviewApi): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PERP_DOCK_LAYOUT_STORAGE_KEY, JSON.stringify(api.toJSON()));
}

export function clearStoredPerpDockLayout(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(PERP_DOCK_LAYOUT_STORAGE_KEY);
}

export function restorePerpDockLayout(
  api: DockviewApi,
  onDefaultLayoutPersisted?: () => void
): void {
  const stored = loadStoredPerpLayout();
  if (stored && isPerpLayoutValid(stored)) {
    try {
      api.fromJSON(stored);
      return;
    } catch {
      clearStoredPerpDockLayout();
    }
  }
  applyDefaultPerpDockLayout(api, onDefaultLayoutPersisted);
}
