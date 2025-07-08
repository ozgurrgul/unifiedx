import { BookData } from "../../types/lib";

export type BitvavoMarket = {
  base: string;
  market: string;
  status: "trading" | "halted";
  orderTypes: (
    | "market"
    | "limit"
    | "stopLoss"
    | "stopLossLimit"
    | "takeProfit"
    | "takeProfitLimit"
  )[];
};

export type BitvavoPrice = {
  market: string;
  price: string;
};

export type BitvavoTicker = {
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

export type BitvavoTrade = {
  id: string;
  price: string;
  side: "buy" | "sell";
  amount: string;
  timestamp: number;
};

export type BitvavoOrder = {
  orderId: string;
  price: string;
  amount: string;
  amountRemaining: string;
  market: string;
  created: number;
  updated: number;
  fills: any[];
  filledAmount: string;
  filledAmountQuote: string;
  orderType: "market" | "limit";
  // | "stopLoss"
  // | "stopLossLimit"
  // | "takeProfit"
  // | "takeProfitLimit";
  postOnly: boolean;
  side: "buy" | "sell";
  status: "canceled" | "new" | "filled";
  timeInForce: string;
};

export type BitvavoBalance = {
  symbol: string;
  available: string;
  inOrder: string;
};

export type WsGetPricesResponse = {
  action: "getTickerPrice";
  response: BitvavoPrice[];
};

export type WsGetTickerPriceResponse = {
  event: "ticker24h";
  data: BitvavoTicker[];
};

export type WsGetInitialTradesResponse = {
  action: "getTrades";
  response: BitvavoTrade[];
};

export type WsTradeEvent = {
  event: "trade";
} & BitvavoTrade;

export type WsGetBookResponse = {
  action: "getBook";
  response: BookData;
};

export type WsBookEvent = {
  event: "book";
} & BookData;

export type WsAuthenticateEvent = {
  event: "authenticate";
  authenticated: boolean;
};

export type WsOrderEvent = {
  event: "order";
  status: BitvavoOrder["status"];
};

export type WsResponses =
  | WsGetPricesResponse
  | WsGetInitialTradesResponse
  | WsGetTickerPriceResponse
  | WsTradeEvent
  | WsGetBookResponse
  | WsBookEvent
  | WsAuthenticateEvent
  | WsOrderEvent;
