"use client";

import { ExchangeWidget } from "../ExchangeWidget";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketOrderForm } from "./MarketOrderForm";
import { LimitOrderForm } from "./LimitOrderForm";
import { CreateOrderPayload } from "@/types/lib";
import { $bus, BusEvent } from "@/components/ExchangeBus";
import { useToast } from "@/components/ui/use-toast";

export const OrderForm: React.FC = () => {
  const {
    getters: {
      activeExchange: { isAuthenticated },
      activeMarket: { balances, base, quote, market },
    },
  } = useContext(ExchangeDataGettersContext);
  const { toast } = useToast();

  const onSubmit = (payload: CreateOrderPayload) => {
    if (isAuthenticated === "yes") {
      $bus.emit(BusEvent.CreateOrder, payload);
      toast({
        title: "Order creating",
        variant: "success",
      });
    } else {
      toast({
        title: "Please set your credentials in the Credentials menu",
        variant: "destructive",
      });
    }
  };

  return (
    <ExchangeWidget type="order-form">
      <Tabs defaultValue="market">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="market">Market order</TabsTrigger>
          <TabsTrigger value="limit">Limit order</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-0">
          <div className="grid grid-cols-2 gap-2 p-2">
            <MarketOrderForm
              side="buy"
              balance={balances[quote?.symbol]}
              asset={quote}
              baseAsset={base}
              market={market}
              onSubmit={onSubmit}
            />
            <MarketOrderForm
              side="sell"
              balance={balances[base?.symbol]}
              asset={base}
              baseAsset={base}
              market={market}
              onSubmit={onSubmit}
            />
          </div>
        </TabsContent>
        <TabsContent value="limit" className="mt-0">
          <div className="grid grid-cols-2 gap-2 p-2">
            <LimitOrderForm
              side="buy"
              balance={balances[quote?.symbol]}
              asset={quote}
              baseAsset={base}
              market={market}
              onSubmit={onSubmit}
            />
            <LimitOrderForm
              side="sell"
              balance={balances[base?.symbol]}
              asset={base}
              baseAsset={base}
              market={market}
              onSubmit={onSubmit}
            />
          </div>
        </TabsContent>
      </Tabs>
    </ExchangeWidget>
  );
};
