import { Trade } from "@/types/lib";
import { Candle, ChartInterval, INTERVAL_SECONDS } from "./types";

export const aggregateCandles = (
  candles: Candle[],
  interval: ChartInterval
): Candle[] => {
  if (interval === "1m" || candles.length === 0) return candles;

  const bucketSize = INTERVAL_SECONDS[interval];
  const buckets = new Map<number, Candle>();

  for (const candle of candles) {
    const bucketTime =
      Math.floor(candle.time / bucketSize) * bucketSize;
    const existing = buckets.get(bucketTime);

    if (!existing) {
      buckets.set(bucketTime, { ...candle, time: bucketTime });
      continue;
    }

    existing.high = Math.max(existing.high, candle.high);
    existing.low = Math.min(existing.low, candle.low);
    existing.close = candle.close;
    existing.volume += candle.volume;
  }

  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
};

export const getCandleStart = (
  timestampMs: number,
  interval: ChartInterval
): number => {
  const intervalSec = INTERVAL_SECONDS[interval];
  const timestampSec = Math.floor(timestampMs / 1000);
  return Math.floor(timestampSec / intervalSec) * intervalSec;
};

export const applyTradeToCandles = (
  candles: Candle[],
  trade: Trade,
  interval: ChartInterval
): { candles: Candle[]; bar: Candle } => {
  if (candles.length === 0) {
    const time = getCandleStart(trade.timestamp, interval);
    const price = parseFloat(trade.price);
    const amount = parseFloat(trade.amount);
    const bar: Candle = {
      time,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: amount,
    };
    return { candles: [bar], bar };
  }

  const price = parseFloat(trade.price);
  const amount = parseFloat(trade.amount);
  const tradeBucket = getCandleStart(trade.timestamp, interval);
  const last = candles[candles.length - 1];

  if (tradeBucket > last.time) {
    const bar: Candle = {
      time: tradeBucket,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: amount,
    };
    return { candles: [...candles, bar], bar };
  }

  if (tradeBucket < last.time) {
    return { candles, bar: last };
  }

  const bar: Candle = {
    ...last,
    close: price,
    high: Math.max(last.high, price),
    low: Math.min(last.low, price),
    volume: last.volume + amount,
  };

  return {
    candles: [...candles.slice(0, -1), bar],
    bar,
  };
};
