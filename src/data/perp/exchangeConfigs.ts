import {
  loadBinancePerpMarkets,
  useBinancePerpData,
} from "../binance/useBinancePerpData";
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
};

export function isPerpSupportedExchange(exchange: string): exchange is PerpSupportedExchange {
  return exchange in perpExchangeConfigs;
}
