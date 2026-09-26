"use client";

import { useEffect } from "react";
import { type ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { useAppNavigation } from "@/hooks/useAppNavigation";

type Props = {
  exchange: ExchangeType;
};

export const ExchangeRedirectToDefaultMarket: React.FC<Props> = ({ exchange }) => {
  const { goToMarket } = useAppNavigation();
  const exchangeConfig = exchangeConfigs[exchange];

  useEffect(() => {
    goToMarket(
      exchange,
      exchangeConfig.defaultMarket.base.symbol,
      exchangeConfig.defaultMarket.quote.symbol
    );
  }, [exchange, exchangeConfig, goToMarket]);

  return null;
};
