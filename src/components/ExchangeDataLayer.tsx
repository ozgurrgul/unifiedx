"use client";

import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import { ExchangeType } from "@/data/exchangeConfigs";
import { usePrevious } from "@uidotdev/usehooks";
import { useContext, useEffect } from "react";
import { $bus, BusEvent } from "./ExchangeBus";
import { ExchangeConfig } from "@/data/types";
import { Market } from "@/types/lib";
import Cookies from "js-cookie";

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
  const previousExchange = usePrevious(activeExchange);
  const previousMarket = usePrevious(activeMarket);
  const credentials: Record<string, string> =
    exchangeConfig.neededCredentials.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: Cookies.get(`${activeExchange}_${cur.id}`) || "",
      };
    }, {});
  const isCredentialsProvided =
    Object.values(credentials).filter((r: string) => r.length).length > 0;

  const {
    readyState,
    onMarketChange,
    mutations: { cancelOrder, createOrder },
    disconnect,
  } = exchangeConfig.data({
    activeMarket,
    setters,
    credentials,
    isCredentialsProvided,
  });

  useEffect(() => {
    if (
      activeExchange &&
      previousExchange &&
      previousExchange !== activeExchange
    ) {
      setters.setOpenOrders([]);
      setters.setInitialTrades([]);
      setters.setMarkets({});
      setters.setPrices({});
      setters.setOpenOrders([]);
      setters.setPastOrders([]);
      setters.setAuthenticated("no");
      setters.setError(undefined);
      setters.setTickers({});
      setters.setBalances({});
      disconnect();
    }
  }, [activeExchange, previousExchange, setters, disconnect]);

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
