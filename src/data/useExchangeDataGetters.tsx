import { useContext } from "react";
import { ExchangeDataSettersContext } from "./ExchangeDataSettersContext";
import type { ExchangeType } from "./exchangeConfigs";

export const useExchangeDataGetters = ({
  activeExchange,
  activeSpotMarketId,
}: {
  activeExchange: ExchangeType;
  activeSpotMarketId: string;
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
      connected,
      initialTradesLoading,
      orderBookLoading,
      marketsLoading,
    },
  } = useContext(ExchangeDataSettersContext);

  return {
    activeExchange: {
      exchange: activeExchange,
      error,
      isConnected: connected,
      isAuthenticated,
      marketsLoading,
    },
    activeSpotMarket: {
      spotMarketId: activeSpotMarketId,
      base: markets[activeSpotMarketId]?.base,
      quote: markets[activeSpotMarketId]?.quote,
      ticker: tickers[activeSpotMarketId],
      trades,
      computedOrderBookData,
      allComputedOrderBookData,
      spotMarkets: markets,
      prices,
      openOrders,
      cancellingOrderIds,
      balances,
      pastOrders,
      initialTradesLoading,
      orderBookLoading,
    },
  };
};
