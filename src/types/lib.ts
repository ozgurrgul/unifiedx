export type SpotMarket = {
  brandSymbol: string;
  /** Spot pair id, e.g. BTC-EUR */
  market: string;
  base: AssetConfig;
  quote: AssetConfig;
  orderCapabilities: {
    marketOrder: {
      active: boolean;
    };
    limitOrder: {
      active: boolean;
    };
  };
};

export type Price = {
  market: string;
  price: string;
};

export type Ticker = {
  market: string;
  last: string;
  ask: string;
  bid: string;
  high: string;
  low: string;
  open: string;
  volume: string;
  volumeQuote: string;
  /** USDT-M perp mark price */
  markPrice?: string;
  /** USDT-M perp index price */
  indexPrice?: string;
  /** Last funding rate (decimal, e.g. 0.0001 = 0.01%) */
  fundingRate?: string;
  /** Next funding settlement time (ms since epoch) */
  nextFundingTimeMs?: number;
};

export type Trade = {
  id: number | string;
  price: string;
  side: "buy" | "sell";
  amount: string;
  timestamp: number;
  market: SpotMarket;
};

export type Order = {
  id: string;
  amount: string;
  amountRemaining: string;
  price: string;
  market: string;
  created: number;
  updated?: number;
  filledAmount: string;
  filledAmountQuote: string;
  type: "limit" | "market";
  // | "stop-loss"
  // | "stop-loss-limit"
  // | "take-profit"
  // | "take-profit-limit";
  side: "buy" | "sell";
  baseAssetSymbol: string;
  quoteAssetSymbol: string;
  status: "filled" | "canceled" | "open" | "unknown";
};

export type CreateOrderPayload = {
  type: Order["type"];
  side: Order["side"];
  market: string;
  amount?: string;
  price?: string;
};

export type AssetConfig = {
  symbol: string;
  precision: number;
};

export type Balance = {
  asset: string;
  available: number;
  inOrder: number;
};

export type SpotMarketsHashmap = Record<string, SpotMarket>;
export type PricesHashmap = Record<string, Price>;
export type TickersHashmap = Record<string, Ticker>;
export type TradesHashmap = Record<string, Trade[]>;
export type BalancesHashmap = Record<string, Balance>;

export type BookEntryPrice = string;
export type BookEntryAmount = string;
export type BookEntry = [BookEntryPrice, BookEntryAmount];
export type BookData = {
  bids: BookEntry[];
  asks: BookEntry[];
  market: SpotMarket;
};
