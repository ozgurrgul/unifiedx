"use client";

import { useContext } from "react";
import { $bus, BusEvent } from "@/components/ExchangeBus";
import { useToast } from "@/components/ui/use-toast";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import type { CreateOrderPayload } from "@/types/lib";
import { ExchangeWidget } from "../ExchangeWidget";
import { LimitOrderForm } from "./LimitOrderForm";
import { MarketOrderForm } from "./MarketOrderForm";

function useOrderSubmit() {
  const {
    getters: {
      activeExchange: { canTrade },
    },
  } = useContext(ExchangeDataGettersContext);
  const { toast } = useToast();

  return (payload: CreateOrderPayload) => {
    if (!canTrade) {
      return;
    }
    $bus.emit(BusEvent.CreateOrder, payload);
    toast({
      title: "Order creating",
      variant: "success",
    });
  };
}

function useOrderFormMarket() {
  const {
    getters: {
      activeSpotMarket: { balances, base, quote, spotMarketId },
    },
  } = useContext(ExchangeDataGettersContext);
  return { balances, base, quote, spotMarketId };
}

export const MarketOrderFormPanel = () => {
  const onSubmit = useOrderSubmit();
  const { balances, base, quote, spotMarketId } = useOrderFormMarket();

  return (
    <ExchangeWidget type="market-order">
      <div className="grid grid-cols-2 divide-x divide-border h-full">
        <div className="p-3 border-t-2 border-bid">
          <MarketOrderForm
            side="buy"
            balance={balances[quote?.symbol]}
            asset={quote}
            baseAsset={base}
            market={spotMarketId}
            onSubmit={onSubmit}
          />
        </div>
        <div className="p-3 border-t-2 border-ask">
          <MarketOrderForm
            side="sell"
            balance={balances[base?.symbol]}
            asset={base}
            baseAsset={base}
            market={spotMarketId}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </ExchangeWidget>
  );
};

export const LimitOrderFormPanel = () => {
  const onSubmit = useOrderSubmit();
  const { balances, base, quote, spotMarketId } = useOrderFormMarket();

  return (
    <ExchangeWidget type="limit-order">
      <div className="grid grid-cols-2 divide-x divide-border h-full">
        <div className="p-3 border-t-2 border-bid">
          <LimitOrderForm
            side="buy"
            balance={balances[quote?.symbol]}
            asset={quote}
            baseAsset={base}
            market={spotMarketId}
            onSubmit={onSubmit}
          />
        </div>
        <div className="p-3 border-t-2 border-ask">
          <LimitOrderForm
            side="sell"
            balance={balances[base?.symbol]}
            asset={base}
            baseAsset={base}
            market={spotMarketId}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </ExchangeWidget>
  );
};
