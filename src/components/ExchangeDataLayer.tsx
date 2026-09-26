"use client";

import { usePrevious } from "@uidotdev/usehooks";
import Cookies from "js-cookie";
import { useContext, useEffect } from "react";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import type { ExchangeType } from "@/data/exchangeConfigs";
import type { ExchangeConfig } from "@/data/types";
import type { Market } from "@/types/lib";
import { $bus, BusEvent } from "./ExchangeBus";

type ExchangeDataLayerProps = {
  activeExchange: ExchangeType;
  activeMarket: Market;
  exchangeConfig: ExchangeConfig;
};

export const ExchangeDataLayer: React.FC<ExchangeDataLayerProps> = ({
  activeExchange,
  activeMarket,
  exchangeConfig,
}) => {
  const { setters } = useContext(ExchangeDataSettersContext);
  const previousMarket = usePrevious(activeMarket);
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
    onMarketChange,
    mutations: { cancelOrder, createOrder },
  } = exchangeConfig.data({
    activeMarket,
    setters,
    credentials,
    isCredentialsProvided,
  });

  useEffect(() => {
    if (activeMarket && activeMarket.market && !previousMarket) {
      onMarketChange(activeMarket);
    } else if (
      activeMarket &&
      previousMarket &&
      previousMarket.market !== activeMarket.market
    ) {
      onMarketChange(activeMarket, previousMarket);
    }
  }, [activeMarket, previousMarket]);

  useEffect(() => {
    $bus.on(BusEvent.CancelOrder, cancelOrder);
    $bus.on(BusEvent.CreateOrder, createOrder);
  }, [$bus]);

  return null;
};
