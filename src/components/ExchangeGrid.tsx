"use client";

import { MarketsWidget } from "./widgets/MarketsWidget";
import { TradesWidget } from "./widgets/TradesWidget";
import { OrderBookWidget } from "./widgets/orderBook/OrderBookWidget";
import { SubHeader } from "./SubHeader";
import { Header } from "./Header";
import { ChartWidget } from "./widgets/ChartWidget";
import { OrdersWidget } from "./widgets/OrdersWidget";
import { useToast } from "./ui/use-toast";
import { useContext, useEffect } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { BalancesWidget } from "./widgets/BalancesWidget";
import { OrderForm } from "./widgets/orderForm/OrderFormWidget";
import { BottomBar } from "./BottomBar";

export const ExchangeGrid = ({}) => {
  const { toast } = useToast();
  const {
    getters: {
      activeExchange: { error },
    },
  } = useContext(ExchangeDataGettersContext);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div>
      <div className="exchange-grid">
        <div className="left" style={{ gridArea: "left" }}></div>
        <Header />
        <SubHeader />
        <MarketsWidget />
        <TradesWidget />
        <ChartWidget />
        <OrderBookWidget />
        <OrderForm />
        <OrdersWidget />
        <div className="right" style={{ gridArea: "right" }}></div>
        <BalancesWidget />
      </div>
      <BottomBar />
    </div>
  );
};
