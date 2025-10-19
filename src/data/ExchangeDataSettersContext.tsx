import { ComputedOrderBookData } from "@/components/widgets/orderBook/types";
import {
  UseExchangeDataSettersInput,
  useExchangeDataSetters,
} from "@/data/useExchangeDataSetters";
import { createContext } from "react";

export type ExchangeDataSettersContextType = {
  setters: ReturnType<typeof useExchangeDataSetters>;
};

export const ExchangeDataSettersContext =
  createContext<ExchangeDataSettersContextType>({
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
  });

export const ExchangeDataSettersContextProvider = ({
  children,
  activeMarket,
}: {
  children: any;
  activeMarket: string;
}) => {
  const setters = useExchangeDataSetters({ activeMarket });

  return (
    <ExchangeDataSettersContext.Provider value={{ setters }}>
      {children}
    </ExchangeDataSettersContext.Provider>
  );
};
