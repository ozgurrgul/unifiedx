"use client";

import { useEffect } from "react";
import { perpExchangeConfigs } from "@/data/perp/exchangeConfigs";
import type { PerpSupportedExchange } from "@/data/perp/types";
import { useAppNavigation } from "@/hooks/useAppNavigation";

type Props = {
  exchange: PerpSupportedExchange;
};

export const ExchangeRedirectToDefaultPerpMarket: React.FC<Props> = ({ exchange }) => {
  const { goToPerpMarket } = useAppNavigation();
  const exchangeConfig = perpExchangeConfigs[exchange];

  useEffect(() => {
    goToPerpMarket(
      exchange,
      exchangeConfig.defaultPerpMarket.base.symbol,
      exchangeConfig.defaultPerpMarket.quote.symbol
    );
  }, [exchange, exchangeConfig, goToPerpMarket]);

  return null;
};
