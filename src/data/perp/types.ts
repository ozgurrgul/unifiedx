import type { ReadyState } from "react-use-websocket/dist/lib/constants";
import type { ExchangeCredentialInput } from "../spot/types";

/** Placeholder until perp markets are modeled in @/types/lib. */
export type PerpMarket = {
  symbol: string;
  base: { symbol: string; precision: number };
  quote: { symbol: string; precision: number };
};

export type PerpMarketsHashmap = Record<string, PerpMarket>;

export type UsePerpExchangeDataInput = {
  activePerpMarket: PerpMarket;
  setters: unknown;
  isCredentialsProvided: boolean;
  credentials?: Record<string, string>;
};

export type UsePerpExchangeDataOutput = {
  readyState: ReadyState;
  onPerpMarketChange: (
    activePerpMarket: PerpMarket,
    previousPerpMarket?: PerpMarket
  ) => void;
  disconnect: () => void;
  mutations: {
    cancelOrder: (order: unknown) => void;
    createOrder: (payload: unknown) => void;
  };
};

/** Shape for a derivatives adapter (e.g. Binance USDT-M) — not wired yet. */
export type PerpExchangeConfig = {
  product: "perp";
  defaultPerpMarket: {
    base: { symbol: string };
    quote: { symbol: string };
  };
  data: (input: UsePerpExchangeDataInput) => UsePerpExchangeDataOutput;
  loadPerpMarkets: () => Promise<PerpMarketsHashmap>;
  wsStreaming: boolean;
  neededCredentials: ExchangeCredentialInput[];
};

export type PerpSupportedExchange = "binance";
