import type { DockviewApi, SerializedDockview } from "dockview";

export const DOCK_LAYOUT_STORAGE_KEY = "unifiedx-dock-layout-v3";

const LEGACY_DOCK_LAYOUT_STORAGE_KEYS = ["unifiedx-dock-layout-v2"] as const;

const DOCK_CONTENT_COMPONENTS = [
  "orderBook",
  "candlestickChart",
  "depthChart",
  "markets",
  "trades",
  "marketOrderForm",
  "limitOrderForm",
  "balances",
  "baseOpenOrders",
  "allOpenOrders",
  "orderHistory",
] as const;

/** Default width for the left (order book) and right (markets) dock columns. */
export const DOCK_SIDE_COLUMN_WIDTH = 400;

const DOCK_COLUMN_GAP_PX = 2;

export const DOCK_PANEL_IDS = {
  orderBook: "order-book",
  chart: "chart",
  depthChart: "depth-chart",
  markets: "markets",
  trades: "trades",
  marketOrder: "market-order",
  limitOrder: "limit-order",
  balances: "balances",
  baseOpenOrders: "base-open-orders",
  allOpenOrders: "all-open-orders",
  orderHistory: "order-history",
} as const;

const REQUIRED_PANEL_IDS = Object.values(DOCK_PANEL_IDS);

export function isStoredDockLayoutValid(data: unknown): data is SerializedDockview {
  if (!data || typeof data !== "object") {
    return false;
  }
  const layout = data as SerializedDockview;
  if (!layout.panels || typeof layout.panels !== "object") {
    return false;
  }
  if (!layout.grid?.root) {
    return false;
  }

  for (const panelId of REQUIRED_PANEL_IDS) {
    const panel = layout.panels[panelId];
    const component = panel?.contentComponent;
    if (
      !component ||
      !DOCK_CONTENT_COMPONENTS.includes(
        component as (typeof DOCK_CONTENT_COMPONENTS)[number]
      )
    ) {
      return false;
    }
  }

  return true;
}

export function isDockRuntimeHealthy(api: DockviewApi): boolean {
  for (const panelId of REQUIRED_PANEL_IDS) {
    if (!api.getPanel(panelId)) {
      return false;
    }
  }
  return true;
}

export function applyDefaultDockLayout(
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

  api.addPanel({
    id: DOCK_PANEL_IDS.depthChart,
    component: "depthChart",
    title: "Depth",
    position: { direction: "within", referencePanel: chart },
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

  const marketOrder = api.addPanel({
    id: DOCK_PANEL_IDS.marketOrder,
    component: "marketOrderForm",
    title: "Market",
    position: { direction: "below", referencePanel: chart },
  });

  api.addPanel({
    id: DOCK_PANEL_IDS.limitOrder,
    component: "limitOrderForm",
    title: "Limit",
    position: { direction: "within", referencePanel: marketOrder },
  });

  api.addPanel({
    id: DOCK_PANEL_IDS.balances,
    component: "balances",
    title: "Balances",
    position: { direction: "below", referencePanel: markets },
  });

  const baseOpenOrders = api.addPanel({
    id: DOCK_PANEL_IDS.baseOpenOrders,
    component: "baseOpenOrders",
    title: "Open orders",
    position: { direction: "below", referencePanel: orderBook },
    initialHeight: 280,
  });

  api.addPanel({
    id: DOCK_PANEL_IDS.allOpenOrders,
    component: "allOpenOrders",
    title: "All open orders",
    position: { direction: "within", referencePanel: baseOpenOrders },
  });

  api.addPanel({
    id: DOCK_PANEL_IDS.orderHistory,
    component: "orderHistory",
    title: "Order history",
    position: { direction: "within", referencePanel: baseOpenOrders },
  });

  queueDefaultColumnWidths(api, onColumnWidthsApplied);
}

/** Load persisted layout or build the default; recover if storage is corrupt. */
export function restoreDockLayout(
  api: DockviewApi,
  onDefaultLayoutPersisted?: () => void
): void {
  const stored = loadStoredDockLayout();

  if (stored && isStoredDockLayoutValid(stored)) {
    try {
      api.fromJSON(stored);
      if (!isDockRuntimeHealthy(api)) {
        throw new Error("dock layout missing panels after restore");
      }
      saveDockLayout(api);
      return;
    } catch {
      clearStoredDockLayout();
    }
  } else if (stored) {
    clearStoredDockLayout();
  }

  applyDefaultDockLayout(api, onDefaultLayoutPersisted);
}

type LayoutGridNode = {
  size?: number;
  data?: LayoutGridNode[];
};

/**
 * Dockview splits space evenly when panels are added without sizes (unlike the
 * old CSS grid minmax columns). This pins the three top-level columns to
 * 400px | flex | 400px once the dock has a real width.
 */
export function applyDefaultColumnWidths(api: DockviewApi): boolean {
  const middleWidth = api.width - DOCK_SIDE_COLUMN_WIDTH * 2 - DOCK_COLUMN_GAP_PX;
  if (middleWidth < 240) {
    return false;
  }

  const json = api.toJSON() as SerializedDockview & {
    grid: { root: LayoutGridNode };
  };
  const columns = json.grid?.root?.data;
  if (!columns || columns.length < 3) {
    return false;
  }

  columns[0].size = DOCK_SIDE_COLUMN_WIDTH;
  columns[1].size = middleWidth;
  columns[2].size = DOCK_SIDE_COLUMN_WIDTH;

  api.fromJSON(json as SerializedDockview, { reuseExistingPanels: true });
  return true;
}

export function queueDefaultColumnWidths(
  api: DockviewApi,
  onApplied?: () => void
): void {
  const attempt = () => {
    if (applyDefaultColumnWidths(api)) {
      onApplied?.();
      return;
    }
    if (api.width > 0) {
      onApplied?.();
      return;
    }
    requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}

function readLayoutFromStorage(key: string): unknown | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function loadStoredDockLayout(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }

  const current = readLayoutFromStorage(DOCK_LAYOUT_STORAGE_KEY);
  if (current) {
    return current;
  }

  for (const legacyKey of LEGACY_DOCK_LAYOUT_STORAGE_KEYS) {
    const legacy = readLayoutFromStorage(legacyKey);
    window.localStorage.removeItem(legacyKey);
    if (legacy && isStoredDockLayoutValid(legacy)) {
      return legacy;
    }
  }

  return null;
}

export function saveDockLayout(api: DockviewApi): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!isDockRuntimeHealthy(api)) {
    return;
  }
  window.localStorage.setItem(DOCK_LAYOUT_STORAGE_KEY, JSON.stringify(api.toJSON()));
  for (const legacyKey of LEGACY_DOCK_LAYOUT_STORAGE_KEYS) {
    window.localStorage.removeItem(legacyKey);
  }
}

export function clearStoredDockLayout(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(DOCK_LAYOUT_STORAGE_KEY);
  for (const legacyKey of LEGACY_DOCK_LAYOUT_STORAGE_KEYS) {
    window.localStorage.removeItem(legacyKey);
  }
}
