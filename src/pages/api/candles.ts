import type { NextApiRequest, NextApiResponse } from "next";
import { ChartInterval } from "@/components/widgets/chart/candlestick/types";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const LIMIT = 500;

const BINANCE_INTERVALS: Record<ChartInterval, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
};

const BITVAVO_INTERVALS: Record<ChartInterval, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
};

const parseCandles = (
  rows: Array<
    | [number, string, string, string, string, string, ...unknown[]]
    | {
        time?: number;
        open?: string | number;
        high?: string | number;
        low?: string | number;
        close?: string | number;
        volume?: string | number;
      }
  >,
  timeIndex = 0
): Candle[] => {
  return rows
    .map((row) => {
      if (Array.isArray(row)) {
        const timeMs = row[timeIndex] as number;
        return {
          time: Math.floor(timeMs / 1000),
          open: parseFloat(row[1] as string),
          high: parseFloat(row[2] as string),
          low: parseFloat(row[3] as string),
          close: parseFloat(row[4] as string),
          volume: parseFloat(row[5] as string),
        };
      }

      const timeSec = row.time
        ? row.time > 1_000_000_000_000
          ? Math.floor(row.time / 1000)
          : row.time
        : 0;

      return {
        time: timeSec,
        open: parseFloat(String(row.open ?? 0)),
        high: parseFloat(String(row.high ?? 0)),
        low: parseFloat(String(row.low ?? 0)),
        close: parseFloat(String(row.close ?? 0)),
        volume: parseFloat(String(row.volume ?? 0)),
      };
    })
    .filter((c) => c.time > 0)
    .sort((a, b) => a.time - b.time);
};

const fetchBinanceCandles = async (
  base: string,
  quote: string,
  interval: ChartInterval
): Promise<Candle[]> => {
  const symbol = `${base}${quote}`;
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${BINANCE_INTERVALS[interval]}&limit=${LIMIT}`
  );
  if (!res.ok) throw new Error(`Binance candles failed: ${res.status}`);
  const json = await res.json();
  return parseCandles(json);
};

const fetchBitvavoCandles = async (
  market: string,
  interval: ChartInterval
): Promise<Candle[]> => {
  const res = await fetch(
    `https://api.bitvavo.com/v2/${market}/candles?interval=${BITVAVO_INTERVALS[interval]}&limit=${LIMIT}`
  );
  if (!res.ok) throw new Error(`Bitvavo candles failed: ${res.status}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  // Bitvavo: [timestamp ms, open, high, low, close, volume]
  return parseCandles(json);
};

const BTC_TURK_RESOLUTION: Record<ChartInterval, string | number> = {
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "1h": 60,
  "4h": 240,
  "1d": "1D",
};

const fetchBtcTurkCandles = async (
  base: string,
  quote: string,
  interval: ChartInterval
): Promise<Candle[]> => {
  const symbol = `${base}${quote}`;
  const resolution = BTC_TURK_RESOLUTION[interval];
  const intervalSec: Record<ChartInterval, number> = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = intervalSec[interval];
  const from = nowSec - LIMIT * bucket;

  const res = await fetch(
    `https://graph-api.btcturk.com/v1/klines/history?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${nowSec}`
  );
  if (!res.ok) throw new Error(`BtcTurk candles failed: ${res.status}`);
  const json = await res.json();

  if (json.s !== "ok" || !Array.isArray(json.t)) {
    throw new Error(json.message || "Invalid BtcTurk kline response");
  }

  const candles: Candle[] = json.t.map((time: number, i: number) => ({
    time,
    open: parseFloat(String(json.o[i])),
    high: parseFloat(String(json.h[i])),
    low: parseFloat(String(json.l[i])),
    close: parseFloat(String(json.c[i])),
    volume: parseFloat(String(json.v[i] ?? 0)),
  }));

  return candles.slice(-LIMIT);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Candle[] | { error: string }>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { exchange, market, base, quote, interval } = req.body as {
    exchange: string;
    market: string;
    base: string;
    quote: string;
    interval: ChartInterval;
  };

  if (!exchange || !base || !quote || !interval) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    let candles: Candle[] = [];

    if (exchange === "binance") {
      candles = await fetchBinanceCandles(base, quote, interval);
    } else if (exchange === "bitvavo") {
      candles = await fetchBitvavoCandles(market, interval);
    } else if (exchange === "btcTurk") {
      candles = await fetchBtcTurkCandles(base, quote, interval);
    } else {
      res.status(400).json({ error: `Unsupported exchange: ${exchange}` });
      return;
    }

    res.status(200).json(candles);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
}
