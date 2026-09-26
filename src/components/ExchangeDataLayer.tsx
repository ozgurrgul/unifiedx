"use client";

import { usePrevious } from "@uidotdev/usehooks";
import Cookies from "js-cookie";
import { useContext, useEffect } from "react";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import type { ExchangeType } from "@/data/exchangeConfigs";
import type { PerpExchangeConfig } from "@/data/perp/exchangeConfigs";
import type { SpotExchangeConfig } from "@/data/spot/types";
import type { SpotMarket } from "@/types/lib";
import { $bus, BusEvent } from "./ExchangeBus";

type ExchangeDataLayerProps = {
  activeExchange: ExchangeType;
  activeSpotMarket: SpotMarket;
  exchangeConfig: SpotExchangeConfig | PerpExchangeConfig;
};

export const ExchangeDataLayer: React.FC<ExchangeDataLayerProps> = ({
  activeExchange,
  activeSpotMarket,
  exchangeConfig,
}) => {
  const { setters } = useContext(ExchangeDataSettersContext);
  const previousMarket = usePrevious(activeSpotMarket);
  const credentials: Record<string, string> = exchangeConfig.neededCredentials.reduce(
    (acc, cur) => {
      return {
        ...acc,
        [cur.id]: Cookies.get(`${activeExchange}_${cur.id}`) || "",
      };
    },
    {}
  );
  const isCredentialsProvided =
    Object.values(credentials).filter((r: string) => r.length).length > 0;

  const {
    onSpotMarketChange,
    mutations: { cancelOrder, createOrder },
  } = exchangeConfig.data({
    activeSpotMarket,
    setters,
    credentials,
    isCredentialsProvided,
  });

  useEffect(() => {
    if (activeSpotMarket && activeSpotMarket.market && !previousMarket) {
      onSpotMarketChange(activeSpotMarket);
    } else if (
      activeSpotMarket &&
      previousMarket &&
      previousMarket.market !== activeSpotMarket.market
    ) {
      onSpotMarketChange(activeSpotMarket, previousMarket);
    }
  }, [activeSpotMarket, previousMarket, onSpotMarketChange]);

  useEffect(() => {
    $bus.on(BusEvent.CancelOrder, cancelOrder);
    $bus.on(BusEvent.CreateOrder, createOrder);
    return () => {
      $bus.off(BusEvent.CancelOrder, cancelOrder);
      $bus.off(BusEvent.CreateOrder, createOrder);
    };
  }, [cancelOrder, createOrder]);

  return null;
};
