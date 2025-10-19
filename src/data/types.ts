import { CreateOrderPayload, Market, MarketsHashmap, Order } from "@/types/lib";
import { ExchangeDataSettersContextType } from "./ExchangeDataSettersContext";
import { ReadyState } from "react-use-websocket/dist/lib/constants";

export type UseExchangeDataInput = {
  activeMarket: Market;
  setters: ExchangeDataSettersContextType["setters"];
  isCredentialsProvided: boolean;
  credentials?: Record<string, string>;
};

export type UseExchangeDataOutput = {
  readyState: ReadyState;
  init?: () => void;
  onMarketChange: (activeMarket: Market, previousMarket?: Market) => void;
  disconnect: () => void;
  mutations: {
    cancelOrder: (order: Order) => void;
    createOrder: (payload: CreateOrderPayload) => void;
  };
};

type ExchangeCredentialInput = {
  name: string;
  id: string;
};

export type ExchangeConfig = {
  defaultMarket: {
    base: {
      symbol: string;
    };
    quote: {
      symbol: string;
    };
  };
  data: (input: UseExchangeDataInput) => UseExchangeDataOutput;
  loadMarkets: () => Promise<MarketsHashmap>;
  wsStreaming: boolean;
  neededCredentials: ExchangeCredentialInput[];
};
