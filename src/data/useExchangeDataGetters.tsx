import { useContext } from "react";
import { ExchangeDataSettersContext } from "./ExchangeDataSettersContext";
import { ExchangeType } from "./exchangeConfigs";

export const useExchangeDataGetters = ({
  activeExchange,
  activeMarket,
}: {
  activeExchange: ExchangeType;
  activeMarket: string;
}) => {
  const {
    setters: {
      markets,
      prices,
      tickers,
      trades,
      computedOrderBookData,
      allComputedOrderBookData,
      openOrders,
      cancellingOrderIds,
      error,
      balances,
      isAuthenticated,
      pastOrders,
    },
  } = useContext(ExchangeDataSettersContext);

  return {
    activeExchange: {
      exchange: activeExchange,
      error,
      isAuthenticated,
    },
    activeMarket: {
      market: activeMarket,
      base: markets[activeMarket]?.base,
      quote: markets[activeMarket]?.quote,
      ticker: tickers[activeMarket],
      trades,
      computedOrderBookData,
      allComputedOrderBookData,
      markets,
      prices,
      openOrders,
      cancellingOrderIds,
      balances,
      pastOrders,
    },
  };
};
