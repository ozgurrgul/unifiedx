import {
  loadSpotMarkets as loadBinanceSpotMarkets,
  useBinanceData,
} from "./binance/useBinanceData";
import {
  loadSpotMarkets as loadBitvavoSpotMarkets,
  useBitvavoData,
} from "./bitvavo/useBitvavoData";
import {
  loadSpotMarkets as loadBtcTurkSpotMarkets,
  useBtcTurkData,
} from "./btcTurk/useBtcTurkData";
import {
  loadSpotMarkets as loadKrakenSpotMarkets,
  useKrakenData,
} from "./kraken/useKrakenData";
import type { SpotExchangeConfig } from "./spot/types";

export type ExchangeType = "binance" | "bitvavo" | "btcTurk" | "kraken";

export const spotExchangeConfigs: { [key in ExchangeType]: SpotExchangeConfig } = {
  binance: {
    product: "spot",
    data: useBinanceData,
    defaultSpotMarket: {
      base: { symbol: "BTC" },
      quote: { symbol: "EUR" },
    },
    loadSpotMarkets: loadBinanceSpotMarkets,
    wsStreaming: true,
    neededCredentials: [],
  },
  bitvavo: {
    product: "spot",
    data: useBitvavoData,
    defaultSpotMarket: {
      base: { symbol: "BTC" },
      quote: { symbol: "EUR" },
    },
    wsStreaming: true,
    loadSpotMarkets: loadBitvavoSpotMarkets,
    neededCredentials: [
      { name: "Api Key", id: "api_key" },
      { name: "Api Secret", id: "api_secret" },
    ],
  },
  btcTurk: {
    product: "spot",
    data: useBtcTurkData,
    defaultSpotMarket: {
      base: { symbol: "BTC" },
      quote: { symbol: "TRY" },
    },
    loadSpotMarkets: loadBtcTurkSpotMarkets,
    wsStreaming: false,
    neededCredentials: [],
  },
  kraken: {
    product: "spot",
    data: useKrakenData,
    defaultSpotMarket: {
      base: { symbol: "BTC" },
      quote: { symbol: "EUR" },
    },
    loadSpotMarkets: loadKrakenSpotMarkets,
    wsStreaming: true,
    neededCredentials: [],
  },
};

/** Spot configs for all supported exchanges. */
export const exchangeConfigs = spotExchangeConfigs;
