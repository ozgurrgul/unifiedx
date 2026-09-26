import {
  loadBinancePerpMarkets,
  useBinancePerpData,
} from "../binance/useBinancePerpData";
import {
  loadHelloTradePerpMarkets,
  useHelloTradePerpData,
} from "../helloTrade/useHelloTradePerpData";
import type { PerpExchangeConfig, PerpSupportedExchange } from "./types";

export type { PerpExchangeConfig, PerpSupportedExchange } from "./types";

export const perpExchangeConfigs: Record<PerpSupportedExchange, PerpExchangeConfig> = {
  binance: {
    product: "perp",
    data: useBinancePerpData,
    defaultPerpMarket: {
      base: { symbol: "BTC" },
      quote: { symbol: "USDT" },
    },
    loadPerpMarkets: loadBinancePerpMarkets,
    wsStreaming: true,
    neededCredentials: [
      { name: "Api Key", id: "api_key" },
      { name: "Api Secret", id: "api_secret" },
    ],
  },
  helloTrade: {
    product: "perp",
    data: useHelloTradePerpData,
    defaultPerpMarket: {
      base: { symbol: "BTC" },
      quote: { symbol: "USDC" },
    },
    loadPerpMarkets: loadHelloTradePerpMarkets,
    wsStreaming: true,
    neededCredentials: [],
  },
};

export function isPerpSupportedExchange(exchange: string): exchange is PerpSupportedExchange {
  return exchange in perpExchangeConfigs;
}
