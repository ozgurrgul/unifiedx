import { createContext } from "react";
import type { ComputedOrderBookData } from "@/components/widgets/orderBook/types";
import type { Ticker } from "@/types/lib";
import type { ExchangeType } from "./exchangeConfigs";
import { useExchangeDataGetters } from "./useExchangeDataGetters";

type ExchangeDataGettersContextType = {
  getters: ReturnType<typeof useExchangeDataGetters>;
};

export const ExchangeDataGettersContext = createContext<ExchangeDataGettersContextType>(
  {
    getters: {
      activeExchange: {
        exchange: "" as ExchangeType,
        error: undefined,
        isConnected: false,
        isAuthenticated: "no",
        canTrade: false,
        marketsLoading: false,
      },
      activeSpotMarket: {
        spotMarketId: "",
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
        spotMarkets: {},
        prices: {},
        openOrders: [],
        cancellingOrderIds: [],
        balances: {},
        pastOrders: [],
        initialTradesLoading: false,
        orderBookLoading: false,
      },
    },
  }
);

export const ExchangeDataGettersContextTypeProvider = ({
  activeSpotMarketId,
  activeExchange,
  children,
}: {
  activeExchange: ExchangeType;
  activeSpotMarketId: string;
  children: any;
}) => {
  const getters = useExchangeDataGetters({ activeSpotMarketId, activeExchange });

  return (
    <ExchangeDataGettersContext.Provider value={{ getters }}>
      {children}
    </ExchangeDataGettersContext.Provider>
  );
};
