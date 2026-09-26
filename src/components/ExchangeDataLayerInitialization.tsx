"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import {
  type ExchangeType,
  isPerpOnlyExchange,
  spotExchangeConfigs,
} from "@/data/exchangeConfigs";
import { ExchangeDataLayer } from "./ExchangeDataLayer";

type ExchangeDataLayerInitializationProps = {
  activeExchange: ExchangeType;
  activeSpotMarketId: string;
};

export const ExchangeDataLayerInitialization: React.FC<
  ExchangeDataLayerInitializationProps
> = ({ activeExchange, activeSpotMarketId }) => {
  const [initialized, setInitialized] = useState(false);
  const { setters } = useContext(ExchangeDataSettersContext);
  const settersRef = useRef(setters);
  settersRef.current = setters;
  const {
    getters: {
      activeSpotMarket: { spotMarkets },
    },
  } = useContext(ExchangeDataGettersContext);

  const isSpotVenue = !isPerpOnlyExchange(activeExchange);
  const exchangeConfig = isSpotVenue ? spotExchangeConfigs[activeExchange] : null;
  const activeSpotMarket = spotMarkets[activeSpotMarketId];

  useEffect(() => {
    if (!exchangeConfig) {
      return;
    }
    let cancelled = false;
    setInitialized(false);
    exchangeConfig
      .loadSpotMarkets()
      .then((r) => {
        if (!cancelled) {
          settersRef.current.setInitialMarkets(r);
          setInitialized(true);
        }
      })
      .catch((r) => {
        if (!cancelled) {
          settersRef.current.setError({ error: r.toString() });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeExchange, exchangeConfig]);

  if (!isSpotVenue || !exchangeConfig) {
    return null;
  }

  if (!initialized) {
    return null;
  }

  if (!activeSpotMarket) {
    return null;
  }

  return (
    <ExchangeDataLayer
      activeExchange={activeExchange}
      activeSpotMarket={activeSpotMarket}
      exchangeConfig={exchangeConfig}
    />
  );
};
