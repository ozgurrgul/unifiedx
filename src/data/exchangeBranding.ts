import type { ExchangeType } from "./exchangeConfigs";

export const exchangeLogos: Record<ExchangeType, string> = {
  binance: "/exchanges/binance.svg",
  bitvavo: "/exchanges/bitvavo.svg",
  btcTurk: "/exchanges/btcTurk.jpg",
  kraken: "/exchanges/kraken.svg",
  helloTrade: "/exchanges/helloTrade.svg",
};

export const exchangeLabels: Record<ExchangeType, string> = {
  binance: "Binance",
  bitvavo: "Bitvavo",
  btcTurk: "BtcTurk",
  kraken: "Kraken",
  helloTrade: "Hello Trade",
};
