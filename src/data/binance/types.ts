import { BookData, BookEntry } from "@/types/lib";

export type BinanceMarket = {
  baseAsset: string;
  symbol: string;
  quoteAsset: string;
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  orderTypes: (
    | "LIMIT"
    | "LIMIT_MAKER"
    | "MARKET"
    | "STOP_LOSS_LIMIT"
    | "TAKE_PROFIT_LIMIT"
  )[];
  status: "TRADING";
};

export type Binance24hTickerPrice = {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  volume: string;
  quoteVolume: string;
};

export type BinanceTradeApi = {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
};

export type BinanceBookApiResponse = {
  lastUpdateId: number;
} & BookData;

export type BinanceTradeWs = {
  stream: string; // trade@depth5
  data: {
    e: "trade";
    t: number; // id
    E: number; // timestamp
    s: string; // symbol
    p: string; // price
    q: string; // quantity
    m: boolean; // side
  };
};

export type BinanceDepthWs = {
  stream: string; // bnbbtc@depth5
  data: {
    a: BookEntry[];
    b: BookEntry[];
    s: string;
    e: "depthUpdate";
  };
};

export type WsResponses = BinanceTradeWs | BinanceDepthWs;
