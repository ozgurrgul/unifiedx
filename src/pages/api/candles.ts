import type { NextApiRequest, NextApiResponse } from "next";
import WebSocket from "ws";
import type { ChartInterval } from "@/components/widgets/chart/candlestick/types";

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

const fetchBinanceFuturesCandles = async (
  base: string,
  quote: string,
  interval: ChartInterval
): Promise<Candle[]> => {
  const symbol = `${base}${quote}`;
  const res = await fetch(
    `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${BINANCE_INTERVALS[interval]}&limit=${LIMIT}`
  );
  if (!res.ok) throw new Error(`Binance futures candles failed: ${res.status}`);
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

const KRAKEN_INTERVALS: Record<ChartInterval, number> = {
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "1h": 60,
  "4h": 240,
  "1d": 1440,
};

const fetchKrakenCandles = async (
  base: string,
  quote: string,
  interval: ChartInterval
): Promise<Candle[]> => {
  const pair = `${base}/${quote}`;
  const res = await fetch(
    `https://api.kraken.com/0/public/OHLC?pair=${encodeURIComponent(pair)}&interval=${KRAKEN_INTERVALS[interval]}`
  );
  if (!res.ok) {
    throw new Error(`Kraken candles failed: ${res.status}`);
  }
  const json = await res.json();
  if (json?.error?.length) {
    throw new Error(json.error.join(", "));
  }
  const rows = Object.values(json.result ?? {}).find((value) => Array.isArray(value)) as
    | Array<[number, string, string, string, string, string, string, number]>
    | undefined;
  if (!rows) {
    return [];
  }
  return parseCandles(
    rows.map((row) => [row[0] * 1000, row[1], row[2], row[3], row[4], row[6]]),
    0
  );
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

const HELLO_TRADE_WS = "wss://marketdata.app.hello.trade/ws";

const HELLO_TRADE_INTERVALS: Record<
  ChartInterval,
  { timespan: "MINUTE" | "HOUR" | "DAY"; multiplier: number; seconds: number }
> = {
  "1m": { timespan: "MINUTE", multiplier: 1, seconds: 60 },
  "5m": { timespan: "MINUTE", multiplier: 5, seconds: 300 },
  "15m": { timespan: "MINUTE", multiplier: 15, seconds: 900 },
  "1h": { timespan: "HOUR", multiplier: 1, seconds: 3600 },
  "4h": { timespan: "HOUR", multiplier: 4, seconds: 14_400 },
  "1d": { timespan: "DAY", multiplier: 1, seconds: 86_400 },
};

const fetchHelloTradeCandles = async (
  symbol: string,
  interval: ChartInterval
): Promise<Candle[]> => {
  const spec = HELLO_TRADE_INTERVALS[interval];
  const nowSec = Math.floor(Date.now() / 1000);
  const from = nowSec - spec.seconds * LIMIT;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(HELLO_TRADE_WS);
    const candles: Candle[] = [];
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      ws.close();
      resolve(candles.sort((a, b) => a.time - b.time).slice(-LIMIT));
    };

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: "candles",
          symbols: [symbol],
          timespan: spec.timespan,
          multiplier: spec.multiplier,
          from,
          to: nowSec,
          combined: true,
        })
      );
    });

    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString()) as {
        type: string;
        channel?: string;
        data?: unknown;
        message?: string;
      };
      if (msg.type === "error") {
        settled = true;
        ws.close();
        reject(new Error(msg.message ?? "Hello Trade candles error"));
        return;
      }
      if (msg.type !== "marketData" || msg.channel !== "candles") {
        return;
      }
      const rows = Array.isArray(msg.data) ? msg.data : [msg.data];
      for (const row of rows) {
        if (!row || typeof row !== "object") {
          continue;
        }
        const r = row as Record<string, string | number>;
        if (r.symbol && r.symbol !== symbol) {
          continue;
        }
        const timeStamp = Number(r.timeStamp ?? r.timestamp ?? 0);
        if (!timeStamp) {
          continue;
        }
        candles.push({
          time: timeStamp > 1_000_000_000_000 ? Math.floor(timeStamp / 1000) : timeStamp,
          open: parseFloat(String(r.open)),
          high: parseFloat(String(r.high)),
          low: parseFloat(String(r.low)),
          close: parseFloat(String(r.close)),
          volume: parseFloat(String(r.volume ?? 0)),
        });
      }
      if (Array.isArray(msg.data)) {
        finish();
      }
    });

    ws.on("error", () => {
      if (!settled) {
        settled = true;
        reject(new Error("Hello Trade candles WebSocket failed"));
      }
    });

    setTimeout(finish, 12_000);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Candle[] | { error: string }>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { exchange, market, base, quote, interval, product } = req.body as {
    exchange: string;
    market: string;
    base: string;
    quote: string;
    interval: ChartInterval;
    product?: "spot" | "perp";
  };

  if (!exchange || !base || !quote || !interval) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    let candles: Candle[] = [];

    if (exchange === "binance") {
      candles =
        product === "perp"
          ? await fetchBinanceFuturesCandles(base, quote, interval)
          : await fetchBinanceCandles(base, quote, interval);
    } else if (exchange === "bitvavo") {
      candles = await fetchBitvavoCandles(market, interval);
    } else if (exchange === "btcTurk") {
      candles = await fetchBtcTurkCandles(base, quote, interval);
    } else if (exchange === "kraken") {
      candles = await fetchKrakenCandles(base, quote, interval);
    } else if (exchange === "helloTrade" && product === "perp") {
      candles = await fetchHelloTradeCandles(base, interval);
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
