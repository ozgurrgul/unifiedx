export type HelloTradeInstrument = {
  id: number;
  symbol: string;
  activityStatus: string;
  minQuantity: string;
  maxQuantity: string;
  pricePrecision: number;
  quantityPrecision: number;
  quantityIncrement: string;
  quoteCurrency: string;
};

export type HelloTradeMarketDataMessage = {
  type: string;
  channel?: string;
  data?: Record<string, unknown>;
  message?: string;
};

export type HelloTradeOrderBookLevel = {
  price: string;
  quantity: string;
  numberOfOrders?: string;
};

export type HelloTradeTickerData = {
  symbol: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  openingPrice: string;
  high: string;
  low: string;
  volume: string;
  quoteVolume: string;
  markPrice?: string;
  indexPrice?: string;
  fundingRate?: string;
  nextFundingTime?: number;
};

export type HelloTradeTradeData = {
  symbol: string;
  price: string;
  quantity: string;
  timestamp: number;
};
