"use client";

import { useEffect } from "react";
import { type SpotExchangeType, spotExchangeConfigs } from "@/data/exchangeConfigs";
import { useAppNavigation } from "@/hooks/useAppNavigation";

type Props = {
  exchange: SpotExchangeType;
};

export const ExchangeRedirectToDefaultSpotMarket: React.FC<Props> = ({ exchange }) => {
  const { goToSpotMarket } = useAppNavigation();
  const exchangeConfig = spotExchangeConfigs[exchange];

  useEffect(() => {
    goToSpotMarket(
      exchange,
      exchangeConfig.defaultSpotMarket.base.symbol,
      exchangeConfig.defaultSpotMarket.quote.symbol
    );
  }, [exchange, exchangeConfig, goToSpotMarket]);

  return null;
};
