export type KrakenAssetPair = {
  altname: string;
  wsname?: string;
  base: string;
  quote: string;
  pair_decimals: number;
  lot_decimals: number;
  status?: string;
};

export type KrakenAssetPairsResponse = {
  error: string[];
  result: Record<string, KrakenAssetPair>;
};

export type KrakenTickerRow = {
  a: [string, string, string];
  b: [string, string, string];
  c: [string, string];
  v: [string, string];
  p: [string, string];
  t: [number, number];
  l: [string, string];
  h: [string, string];
  o: string;
};

export type KrakenTickerResponse = {
  error: string[];
  result: Record<string, KrakenTickerRow>;
};

export type KrakenDepthResponse = {
  error: string[];
  result: Record<
    string,
    {
      asks: [string, string, number][];
      bids: [string, string, number][];
    }
  >;
};

export type KrakenTradeRow = [string, string, number, "b" | "s", string, string, number];

export type KrakenTradesResponse = {
  error: string[];
  result: Record<string, KrakenTradeRow[]> & { last?: string };
};

export type KrakenBookLevel = {
  price: number;
  qty: number;
};

export type KrakenWsBookMessage = {
  channel: "book";
  type: "snapshot" | "update";
  data: {
    symbol: string;
    bids: KrakenBookLevel[];
    asks: KrakenBookLevel[];
  }[];
};

export type KrakenWsTradeMessage = {
  channel: "trade";
  type: "update";
  data: {
    symbol: string;
    side: "buy" | "sell";
    price: number;
    qty: number;
    trade_id: number;
    timestamp: string;
  }[];
};

export type KrakenWsMessage =
  | KrakenWsBookMessage
  | KrakenWsTradeMessage
  | { channel: "heartbeat" | "status" | "subscription" };
