"use client";

import { ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useEffect } from "react";

type Props = {
  exchange: ExchangeType;
};

export const ExchangeRedirectToDefaultMarket: React.FC<Props> = ({
  exchange,
}) => {
  const { goToMarket } = useAppNavigation();
  const exchangeConfig = exchangeConfigs[exchange];

  useEffect(() => {
    goToMarket(
      exchange,
      exchangeConfig.defaultMarket.base.symbol,
      exchangeConfig.defaultMarket.quote.symbol
    );
  }, [goToMarket]);

  return null;
};
