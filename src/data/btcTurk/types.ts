import { BookData, BookEntry } from "@/types/lib";

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

export type WsResponses = [number, { type: number; message: string }];
