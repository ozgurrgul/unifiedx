import {
  loadMarkets as loadBinanceMarkets,
  useBinanceData,
} from "./binance/useBinanceData";
import {
  loadMarkets as loadBitvavoMarkets,
  useBitvavoData,
} from "./bitvavo/useBitvavoData";
import {
  loadMarkets as loadBtcTurkMarkets,
  useBtcTurkData,
} from "./btcTurk/useBtcTurkData";
import { loadMarkets as loadKrakenMarkets, useKrakenData } from "./kraken/useKrakenData";
import type { ExchangeConfig } from "./types";

export type ExchangeType = "binance" | "bitvavo" | "btcTurk" | "kraken";

export const exchangeConfigs: { [key in ExchangeType]: ExchangeConfig } = {
  binance: {
    data: useBinanceData,
    defaultMarket: {
      base: {
        symbol: "BTC",
      },
      quote: {
        symbol: "EUR",
      },
    },
    loadMarkets: loadBinanceMarkets,
    wsStreaming: true,
    neededCredentials: [],
  },
  bitvavo: {
    data: useBitvavoData,
    defaultMarket: {
      base: {
        symbol: "BTC",
      },
      quote: {
        symbol: "EUR",
      },
    },
    wsStreaming: true,
    loadMarkets: loadBitvavoMarkets,
    neededCredentials: [
      {
        name: "Api Key",
        id: "api_key",
      },
      {
        name: "Api Secret",
        id: "api_secret",
      },
    ],
  },
  btcTurk: {
    data: useBtcTurkData,
    defaultMarket: {
      base: {
        symbol: "BTC",
      },
      quote: {
        symbol: "TRY",
      },
    },
    loadMarkets: loadBtcTurkMarkets,
    wsStreaming: false,
    neededCredentials: [
      // {
      //   name: "Public Key",
      //   id: "public_key",
      // },
      // {
      //   name: "Private key",
      //   id: "private_key",
      // },
    ],
  },
  kraken: {
    data: useKrakenData,
    defaultMarket: {
      base: {
        symbol: "BTC",
      },
      quote: {
        symbol: "EUR",
      },
    },
    loadMarkets: loadKrakenMarkets,
    wsStreaming: true,
    neededCredentials: [],
  },
};
