import { type Candle, ChartInterval, type FetchCandlesParams } from "./types";

export const fetchCandles = async ({
  exchange,
  market,
  base,
  quote,
  interval,
  product,
}: FetchCandlesParams): Promise<Candle[]> => {
  const res = await fetch("/api/candles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exchange, market, base, quote, interval, product }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch candles");
  }

  return json as Candle[];
};
