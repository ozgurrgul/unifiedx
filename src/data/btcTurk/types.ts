import { type BookData, BookEntry } from "@/types/lib";

export type BtcTurkSymbol = {
  name: string; // BTCTRY
  nameNormalized: string; // BTC_TRY
  status: "TRADING";
  numerator: string; // BTC
  denominator: string; // TRY
  orderMethods: ("MARKET" | "LIMIT" | "STOP_MARKET" | "STOP_LIMIT")[];
};

export type BtcTurkCurrency = {
  symbol: string; // BTC
  precision: number;
};

export type BtcTurkTrade = {
  tid: string;
  price: string;
  side: "buy" | "sell";
  amount: string;
  date: number;
};

export type BtcTurkTicker = {
  pair: string;
  pairNormalized: string;
  last: number;
  ask: number;
  bid: number;
  high: number;
  low: number;
  open: number;
  volume: number;
};

export type BtcTurkBook = {} & BookData;

export type BtcTurkWsTradeSingle = {
  type: 422;
  PS: string;
  A: string;
  S: 0 | 1;
  D: number;
  P: string;
  I: string;
};

export type BtcTurkWsTradeList = {
  type: 421;
  PS?: string;
  items?: BtcTurkWsTradeSingle[];
};

export type BtcTurkWsOrderBookFull = {
  type: 431;
  PS: string;
  AO: { P: string; A: string }[];
  BO: { P: string; A: string }[];
};

export type BtcTurkWsOrderBookDiff = {
  type: 432;
  PS: string;
  AO: { P: string; A: string; CP: number }[];
  BO: { P: string; A: string; CP: number }[];
};

export type WsResponses =
  | [number, { type: number; message: string }]
  | [421, BtcTurkWsTradeList]
  | [422, BtcTurkWsTradeSingle]
  | [431, BtcTurkWsOrderBookFull]
  | [432, BtcTurkWsOrderBookDiff];
