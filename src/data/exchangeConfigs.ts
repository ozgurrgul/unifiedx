import {
  useBinanceData,
  loadMarkets as loadBinanceMarkets,
} from "./binance/useBinanceData";
import {
  useBitvavoData,
  loadMarkets as loadBitvavoMarkets,
} from "./bitvavo/useBitvavoData";
import {
  useBtcTurkData,
  loadMarkets as loadBtcTurkMarkets,
} from "./btcTurk/useBtcTurkData";
import { ExchangeConfig } from "./types";

export const exchangeConfigs: { [key: string]: ExchangeConfig } = {
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
};

export type ExchangeType = keyof typeof exchangeConfigs;
