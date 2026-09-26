export type ChartInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const CHART_INTERVALS: ChartInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"];

export const INTERVAL_SECONDS: Record<ChartInterval, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

export type FetchCandlesParams = {
  exchange: string;
  market: string;
  base: string;
  quote: string;
  brandSymbol: string;
  interval: ChartInterval;
  limit?: number;
  product?: "spot" | "perp";
};
