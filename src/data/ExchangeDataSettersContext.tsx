import { createContext } from "react";
import type { ComputedOrderBookData } from "@/components/widgets/orderBook/types";
import {
  type UseSpotExchangeDataSettersInput,
  useExchangeDataSetters,
} from "@/data/useExchangeDataSetters";

export type ExchangeDataSettersContextType = {
  setters: ReturnType<typeof useExchangeDataSetters>;
};

export const ExchangeDataSettersContext = createContext<ExchangeDataSettersContextType>(
  {
    setters: {
      addTrade: () => {},
      setInitialMarkets: () => {},
      setPrices: () => {},
      setTickers: () => {},
      markets: {},
      prices: {},
      tickers: {},
      setInitialTrades: () => {},
      trades: [],
      setBookData: () => {},
      addBookData: () => {},
      computedOrderBookData: {} as ComputedOrderBookData,
      allComputedOrderBookData: {} as ComputedOrderBookData,
      updateVisibleOrderBookRowsNumber: () => {},
      openOrders: [],
      setOpenOrders: () => {},
      cancellingOrderIds: [],
      addCancellingOrderIds: () => {},
      removeCancellingOrderIds: () => {},
      error: undefined,
      setError: () => {},
      balances: {},
      setBalances: () => {},
      isAuthenticated: "no",
      setAuthenticated: () => {},
      pastOrders: [],
      setPastOrders: () => {},
      connected: false,
      setConnected: () => {},
      initialTradesLoading: false,
      orderBookLoading: false,
      marketsLoading: false,
    },
  }
);

export const ExchangeDataSettersContextProvider = ({
  children,
  activeSpotMarketId,
}: {
  children: any;
  activeSpotMarketId: string;
}) => {
  const setters = useExchangeDataSetters({ activeSpotMarketId });

  return (
    <ExchangeDataSettersContext.Provider value={{ setters }}>
      {children}
    </ExchangeDataSettersContext.Provider>
  );
};

export type { UseSpotExchangeDataSettersInput };
