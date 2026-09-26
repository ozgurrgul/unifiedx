import type { DockviewApi, SerializedDockview } from "dockview";

export const DOCK_LAYOUT_STORAGE_KEY = "unifiedx-dock-layout-v2";

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

  api.addPanel({
    id: DOCK_PANEL_IDS.markets,
    component: "markets",
    title: "Markets",
    position: { direction: "right", referencePanel: chart },
    initialWidth: DOCK_SIDE_COLUMN_WIDTH,
  });

  const trades = api.addPanel({
    id: DOCK_PANEL_IDS.trades,
    component: "trades",
    title: "Trades",
    position: { direction: "below", referencePanel: orderBook },
  });

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

  const marketsPanel = api.getPanel(DOCK_PANEL_IDS.markets);
  if (marketsPanel) {
    api.addPanel({
      id: DOCK_PANEL_IDS.balances,
      component: "balances",
      title: "Balances",
      position: { direction: "below", referencePanel: marketsPanel },
    });
  }

  const baseOpenOrders = api.addPanel({
    id: DOCK_PANEL_IDS.baseOpenOrders,
    component: "baseOpenOrders",
    title: "Open orders",
    position: { direction: "below", referencePanel: trades },
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

export function loadStoredDockLayout(): unknown | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(DOCK_LAYOUT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function saveDockLayout(api: DockviewApi): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(DOCK_LAYOUT_STORAGE_KEY, JSON.stringify(api.toJSON()));
}

export function clearStoredDockLayout(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(DOCK_LAYOUT_STORAGE_KEY);
}
