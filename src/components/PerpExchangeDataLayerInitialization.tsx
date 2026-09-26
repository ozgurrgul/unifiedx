"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import {
  isPerpSupportedExchange,
  perpExchangeConfigs,
} from "@/data/perp/exchangeConfigs";
import type { ExchangeType } from "@/data/exchangeConfigs";
import { ExchangeDataLayer } from "./ExchangeDataLayer";

type Props = {
  activeExchange: ExchangeType;
  activeSpotMarketId: string;
};

export const PerpExchangeDataLayerInitialization: React.FC<Props> = ({
  activeExchange,
  activeSpotMarketId,
}) => {
  const [initialized, setInitialized] = useState(false);
  const { setters } = useContext(ExchangeDataSettersContext);
  const settersRef = useRef(setters);
  settersRef.current = setters;
  const {
    getters: {
      activeSpotMarket: { spotMarkets },
    },
  } = useContext(ExchangeDataGettersContext);

  const supported = isPerpSupportedExchange(activeExchange);
  const exchangeConfig = supported ? perpExchangeConfigs[activeExchange] : null;
  const activeSpotMarket = spotMarkets[activeSpotMarketId];

  useEffect(() => {
    if (!exchangeConfig) {
      return;
    }
    let cancelled = false;
    setInitialized(false);
    exchangeConfig
      .loadPerpMarkets()
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

  if (!exchangeConfig || !initialized || !activeSpotMarket) {
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
