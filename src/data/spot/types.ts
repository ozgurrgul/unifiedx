import type { ReadyState } from "react-use-websocket/dist/lib/constants";
import type {
  CreateOrderPayload,
  Order,
  SpotMarket,
  SpotMarketsHashmap,
} from "@/types/lib";
import type { ExchangeDataSettersContextType } from "../ExchangeDataSettersContext";

export type ExchangeCredentialInput = {
  name: string;
  id: string;
};

export type UseSpotExchangeDataInput = {
  activeSpotMarket: SpotMarket;
  setters: ExchangeDataSettersContextType["setters"];
  isCredentialsProvided: boolean;
  credentials?: Record<string, string>;
};

export type UseSpotExchangeDataOutput = {
  readyState: ReadyState;
  init?: () => void;
  onSpotMarketChange: (
    activeSpotMarket: SpotMarket,
    previousSpotMarket?: SpotMarket
  ) => void;
  disconnect: () => void;
  mutations: {
    cancelOrder: (order: Order) => void;
    createOrder: (payload: CreateOrderPayload) => void;
  };
};

export type SpotExchangeConfig = {
  product: "spot";
  defaultSpotMarket: {
    base: {
      symbol: string;
    };
    quote: {
      symbol: string;
    };
  };
  data: (input: UseSpotExchangeDataInput) => UseSpotExchangeDataOutput;
  loadSpotMarkets: () => Promise<SpotMarketsHashmap>;
  wsStreaming: boolean;
  neededCredentials: ExchangeCredentialInput[];
};
