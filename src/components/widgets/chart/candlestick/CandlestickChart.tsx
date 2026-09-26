"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useContext, useEffect, useRef, useState } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { cn } from "@/lib/utils";
import { applyTradeToCandles } from "./candleUtils";
import { fetchCandles } from "./fetchCandles";
import { type Candle, CHART_INTERVALS, type ChartInterval } from "./types";

const CHART_COLORS = {
  background: "#0e0e12",
  text: "#868698",
  grid: "#1a1a20",
  border: "#2a2a32",
  up: "#26a69a",
  down: "#ef5350",
};

const toSeriesTime = (time: number) => time as UTCTimestamp;

const toSeriesData = (candles: Candle[]) =>
  candles.map((c) => ({
    time: toSeriesTime(c.time),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));

export const CandlestickChart = () => {
  const {
    getters: {
      activeExchange: { exchange },
      activeSpotMarket: { spotMarketId, base, quote, trades },
    },
  } = useContext(ExchangeDataGettersContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const lastTradeIdRef = useRef<string | number | null>(null);

  const [interval, setInterval] = useState<ChartInterval>("1m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Init chart once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor: CHART_COLORS.text,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: CHART_COLORS.grid },
        horzLines: { color: CHART_COLORS.grid },
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.border,
      },
      timeScale: {
        borderColor: CHART_COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#555", labelBackgroundColor: "#2a2a32" },
        horzLine: { color: "#555", labelBackgroundColor: "#2a2a32" },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.up,
      downColor: CHART_COLORS.down,
      borderUpColor: CHART_COLORS.up,
      borderDownColor: CHART_COLORS.down,
      wickUpColor: CHART_COLORS.up,
      wickDownColor: CHART_COLORS.down,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.timeScale().applyOptions({
      secondsVisible: interval === "1m",
    });
  }, [interval]);

  // Load candles when market or interval changes
  useEffect(() => {
    if (!exchange || !spotMarketId || !base?.symbol || !quote?.symbol) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    lastTradeIdRef.current = null;

    fetchCandles({
      exchange,
      market: spotMarketId,
      base: base.symbol,
      quote: quote.symbol,
      brandSymbol: "",
      interval,
    })
      .then((candles) => {
        if (cancelled) return;
        candlesRef.current = candles;
        seriesRef.current?.setData(toSeriesData(candles));
        chartRef.current?.timeScale().fitContent();
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load chart");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exchange, spotMarketId, base?.symbol, quote?.symbol, interval]);

  // Live update from latest trade
  useEffect(() => {
    const latest = trades?.[0];
    if (!latest || loading || !seriesRef.current) return;
    if (latest.id === lastTradeIdRef.current) return;
    lastTradeIdRef.current = latest.id;

    const { candles, bar } = applyTradeToCandles(candlesRef.current, latest, interval);
    candlesRef.current = candles;
    seriesRef.current.update({
      time: toSeriesTime(bar.time),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    });
  }, [trades, interval, loading]);

  return (
    <div className="relative w-full h-full min-h-[200px] flex flex-col">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border shrink-0">
        {CHART_INTERVALS.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setInterval(tf)}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
              interval === tf
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tf}
          </button>
        ))}
        {base?.symbol && quote?.symbol && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {base.symbol}/{quote.symbol}
          </span>
        )}
      </div>

      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <span className="text-xs text-muted-foreground">Loading chart…</span>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-xs text-ask">{error}</span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
