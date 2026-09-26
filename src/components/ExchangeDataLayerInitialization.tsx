"use client";

import { useContext, useEffect, useState } from "react";
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
  const {
    getters: {
      activeMarket: { markets },
    },
  } = useContext(ExchangeDataGettersContext);

  const exchangeConfig = exchangeConfigs[activeExchange];
  const activeMarket = markets[activeMarketStr];

  useEffect(() => {
    exchangeConfig
      .loadMarkets()
      .then((r) => {
        setters.setInitialMarkets(r);
        setInitialized(true);
      })
      .catch((r) => {
        setters.setError({ error: r.toString() });
      });
  }, [setInitialized]);

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
