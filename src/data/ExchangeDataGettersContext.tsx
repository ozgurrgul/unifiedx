import { createContext } from "react";
import { useExchangeDataGetters } from "./useExchangeDataGetters";
import { ComputedOrderBookData } from "@/components/widgets/orderBook/types";
import { Ticker } from "@/types/lib";
import { ExchangeType } from "./exchangeConfigs";

type ExchangeDataGettersContextType = {
  getters: ReturnType<typeof useExchangeDataGetters>;
};

export const ExchangeDataGettersContext =
  createContext<ExchangeDataGettersContextType>({
    getters: {
      activeExchange: {
        exchange: "" as ExchangeType,
        error: undefined,
        isConnected: false,
        isAuthenticated: "no",
      },
      activeMarket: {
        market: "",
        base: {
          symbol: "",
          precision: 0,
        },
        quote: {
          symbol: "",
          precision: 0,
        },
        ticker: {} as Ticker,
        trades: [],
        computedOrderBookData: {} as ComputedOrderBookData,
        allComputedOrderBookData: {} as ComputedOrderBookData,
        markets: {},
        prices: {},
        openOrders: [],
        cancellingOrderIds: [],
        balances: {},
        pastOrders: [],
        initialTradesLoading: false,
      },
    },
  });

export const ExchangeDataGettersContextTypeProvider = ({
  activeMarket,
  activeExchange,
  children,
}: {
  activeExchange: ExchangeType;
  activeMarket: string;
  children: any;
}) => {
  const getters = useExchangeDataGetters({ activeMarket, activeExchange });

  return (
    <ExchangeDataGettersContext.Provider value={{ getters }}>
      {children}
    </ExchangeDataGettersContext.Provider>
  );
};
