"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import { type ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { ExchangeDataLayer } from "./ExchangeDataLayer";

type ExchangeDataLayerInitializationProps = {
  activeExchange: ExchangeType;
  activeMarket: string;
};

export const ExchangeDataLayerInitialization: React.FC<
  ExchangeDataLayerInitializationProps
> = ({ activeExchange, activeMarket: activeMarketStr }) => {
  const [initialized, setInitialized] = useState(false);
  const { setters } = useContext(ExchangeDataSettersContext);
  const settersRef = useRef(setters);
  settersRef.current = setters;
  const {
    getters: {
      activeMarket: { markets },
    },
  } = useContext(ExchangeDataGettersContext);

  const exchangeConfig = exchangeConfigs[activeExchange];
  const activeMarket = markets[activeMarketStr];

  useEffect(() => {
    let cancelled = false;
    setInitialized(false);
    exchangeConfig
      .loadMarkets()
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

  if (!initialized) {
    return null;
  }

  if (!activeMarket) {
    return null;
  }

  return (
    <ExchangeDataLayer
      activeExchange={activeExchange}
      activeMarket={activeMarket}
      exchangeConfig={exchangeConfig}
    />
  );
};
