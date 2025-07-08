"use client";

import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import { ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { useContext, useEffect, useState } from "react";
import { ExchangeDataLayer } from "./ExchangeDataLayer";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { $bus, BusEvent } from "./ExchangeBus";

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
        setters.setMarkets(r);
        setInitialized(true);
      })
      .catch((r) => {
        setters.setError({ error: r.toString() });
      });
  }, [setInitialized]);

  useEffect(() => {
    $bus.on(BusEvent.RefreshDataLayer, () => {
      setInitialized(false);
      setTimeout(() => {
        setInitialized(true);
      }, 100);
    });
  }, [$bus]);

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
