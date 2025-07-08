export type Market = {
  brandSymbol: string;
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
};

export type Trade = {
  id: number | string;
  price: string;
  side: "buy" | "sell";
  amount: string;
  timestamp: number;
  market: Market;
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
  precision?: number;
};

export type Balance = {
  asset: string;
  available: number;
  inOrder: number;
};

export type MarketsHashmap = Record<string, Market>;
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
  market: Market;
};
