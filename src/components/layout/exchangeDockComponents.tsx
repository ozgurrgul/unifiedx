"use client";

import type { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { DockviewDefaultTab } from "dockview-react";
import type React from "react";
import { BalancesWidget } from "../widgets/BalancesWidget";
import { CandlestickChartPanel, DepthChartPanel } from "../widgets/ChartPanels";
import { MarketsWidget } from "../widgets/MarketsWidget";
import { OrderBookWidget } from "../widgets/orderBook/OrderBookWidget";
import {
  LimitOrderFormPanel,
  MarketOrderFormPanel,
} from "../widgets/orderForm/OrderFormPanels";
import {
  AllOpenOrdersPanel,
  BaseOpenOrdersPanel,
  OrderHistoryPanel,
} from "../widgets/orders/OrdersPanels";
import { TradesWidget } from "../widgets/TradesWidget";
import { DOCK_PANEL_IDS } from "./defaultDockLayout";

function DockPanelShell({
  panelId,
  children,
}: {
  panelId: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-full min-h-0 flex flex-col bg-card"
      data-testid={`dock-panel-${panelId}`}
    >
      {children}
    </div>
  );
}

export function ExchangeDockTab(props: IDockviewPanelHeaderProps) {
  const panelId = props.api.id;
  return (
    <div
      data-testid={`dock-tab-${panelId}`}
      className="dock-tab-shell flex min-h-[36px] items-stretch"
    >
      <DockviewDefaultTab {...props} hideClose className="unifiedx-dock-tab" />
    </div>
  );
}

export const exchangeDockComponents: Record<
  string,
  React.FunctionComponent<IDockviewPanelProps>
> = {
  orderBook: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.orderBook}>
      <OrderBookWidget />
    </DockPanelShell>
  ),
  candlestickChart: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.chart}>
      <CandlestickChartPanel />
    </DockPanelShell>
  ),
  depthChart: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.depthChart}>
      <DepthChartPanel />
    </DockPanelShell>
  ),
  markets: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.markets}>
      <MarketsWidget />
    </DockPanelShell>
  ),
  trades: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.trades}>
      <TradesWidget />
    </DockPanelShell>
  ),
  marketOrderForm: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.marketOrder}>
      <MarketOrderFormPanel />
    </DockPanelShell>
  ),
  limitOrderForm: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.limitOrder}>
      <LimitOrderFormPanel />
    </DockPanelShell>
  ),
  balances: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.balances}>
      <BalancesWidget />
    </DockPanelShell>
  ),
  baseOpenOrders: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.baseOpenOrders}>
      <BaseOpenOrdersPanel />
    </DockPanelShell>
  ),
  allOpenOrders: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.allOpenOrders}>
      <AllOpenOrdersPanel />
    </DockPanelShell>
  ),
  orderHistory: () => (
    <DockPanelShell panelId={DOCK_PANEL_IDS.orderHistory}>
      <OrderHistoryPanel />
    </DockPanelShell>
  ),
};
