"use client";

import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Highcharts, { Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  buildDepthSeries,
  formatDepthPrice,
  formatDepthVolume,
  getVolumeAxisMax,
} from "./buildDepthSeries";

const BID_COLOR = "#26a69a";
const BID_FILL = "rgba(38, 166, 154, 0.22)";
const ASK_COLOR = "#ef5350";
const ASK_FILL = "rgba(239, 83, 80, 0.22)";
const GRID = "#1e1e24";
const LABEL = "#6b6b76";

const buildChartOptions = ({
  bidsData,
  asksData,
  midPrice,
  xMin,
  xMax,
  yMax,
  baseSymbol,
  quoteSymbol,
  quotePrecision,
  height,
}: {
  bidsData: [number, number][];
  asksData: [number, number][];
  midPrice: number;
  xMin: number;
  xMax: number;
  yMax: number;
  baseSymbol: string;
  quoteSymbol: string;
  quotePrecision: number;
  height: number;
}): Options => ({
  chart: {
    type: "area",
    backgroundColor: "transparent",
    animation: false,
    height,
    spacing: [6, 4, 4, 4],
    margin: [8, 4, 28, 4],
    style: { fontFamily: "inherit" },
  },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    min: xMin,
    max: xMax,
    minPadding: 0,
    maxPadding: 0,
    startOnTick: false,
    endOnTick: false,
    tickLength: 0,
    lineWidth: 0,
    labels: {
      y: 16,
      style: { color: LABEL, fontSize: "10px" },
      formatter() {
        const price = Number(this.value);
        // Only show left, mid, and right labels like exchanges do
        const isMid = Math.abs(price - midPrice) / midPrice < 0.001;
        const isEdge =
          Math.abs(price - xMin) / (xMax - xMin) < 0.02 ||
          Math.abs(price - xMax) / (xMax - xMin) < 0.02;
        if (!isMid && !isEdge) return "";
        return `${formatDepthPrice(price, quotePrecision)} ${quoteSymbol}`;
      },
    },
    crosshair: {
      width: 1,
      color: "#555",
      dashStyle: "Dot",
    },
    plotLines: [
      {
        value: midPrice,
        color: "#444",
        dashStyle: "Dash",
        width: 1,
        zIndex: 3,
        label: {
          text: `${formatDepthPrice(midPrice, quotePrecision)} ${quoteSymbol}`,
          align: "center",
          rotation: 0,
          y: 14,
          style: { color: LABEL, fontSize: "10px" },
        },
      },
    ],
  },
  yAxis: {
    min: 0,
    max: yMax,
    startOnTick: false,
    endOnTick: false,
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0,
    title: { text: undefined },
    labels: { enabled: false },
  },
  legend: { enabled: false },
  tooltip: {
    shared: true,
    useHTML: true,
    backgroundColor: "#16161c",
    borderColor: "#2a2a32",
    borderRadius: 4,
    padding: 10,
    shadow: false,
    style: { color: "#d4d4dc", fontSize: "11px" },
    formatter() {
      const price = Number(this.x);
      let html = `<div style="font-size:10px;color:${LABEL};margin-bottom:6px">${formatDepthPrice(price, quotePrecision)} ${quoteSymbol}</div>`;

      for (const point of this.points ?? []) {
        if (Number(point.y) === 0) continue;
        const color = point.series.name === "Bids" ? BID_COLOR : ASK_COLOR;
        html += `<div style="display:flex;gap:8px;justify-content:space-between;margin-top:3px">
          <span style="color:${color}">${point.series.name}</span>
          <span style="font-weight:600;font-variant-numeric:tabular-nums">${formatDepthVolume(Number(point.y))} ${baseSymbol}</span>
        </div>`;
      }

      return html;
    },
  },
  plotOptions: {
    series: {
      animation: false,
      states: {
        inactive: { opacity: 1 },
        hover: { lineWidthPlus: 0 },
      },
    },
    area: {
      lineWidth: 1,
      animation: false,
      marker: { enabled: false },
      fillOpacity: 1,
      threshold: 0,
    },
  },
  series: [
    {
      name: "Bids",
      type: "area",
      data: bidsData,
      step: "right",
      color: BID_COLOR,
      fillColor: BID_FILL,
      zIndex: 1,
    },
    {
      name: "Asks",
      type: "area",
      data: asksData,
      step: "left",
      color: ASK_COLOR,
      fillColor: ASK_FILL,
      zIndex: 1,
    },
  ],
});

export const DepthChart = () => {
  const {
    getters: {
      activeMarket: {
        allComputedOrderBookData: bookData,
        base,
        quote,
        orderBookLoading,
      },
    },
  } = useContext(ExchangeDataGettersContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [height, setHeight] = useState(280);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeight(Math.max(Math.floor(entry.contentRect.height), 160));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const depthData = useMemo(
    () =>
      buildDepthSeries(
        bookData?.bids ?? [],
        bookData?.asks ?? [],
        bookData?.midMarketPrice
      ),
    [bookData]
  );

  const options = useMemo(
    () =>
      buildChartOptions({
        bidsData: depthData.bids,
        asksData: depthData.asks,
        midPrice: depthData.midPrice,
        xMin: depthData.xMin,
        xMax: depthData.xMax,
        yMax: getVolumeAxisMax(
          depthData.maxBidVolume,
          depthData.maxAskVolume
        ),
        baseSymbol: base?.symbol ?? "",
        quoteSymbol: quote?.symbol ?? "",
        quotePrecision: quote?.precision ?? 2,
        height,
      }),
    [depthData, base?.symbol, quote?.symbol, quote?.precision, height]
  );

  useEffect(() => {
    chartRef.current?.chart?.setSize(undefined, height, false);
  }, [height]);

  const hasData =
    depthData.maxBidVolume > 0 || depthData.maxAskVolume > 0;

  if (orderBookLoading) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full min-h-[200px] flex items-center justify-center"
      >
        <span className="text-xs text-muted-foreground">
          Loading depth data…
        </span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full min-h-[200px] flex items-center justify-center"
      >
        <span className="text-xs text-muted-foreground">
          No order book data available
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[200px]">
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
        immutable={false}
      />
      {/* Edge volume labels like Kraken */}
      {depthData.maxBidVolume > 0 && (
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums pointer-events-none"
          style={{ color: BID_COLOR, backgroundColor: "rgba(38,166,154,0.15)" }}
        >
          {formatDepthVolume(depthData.maxBidVolume)}
        </div>
      )}
      {depthData.maxAskVolume > 0 && (
        <div
          className="absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums pointer-events-none"
          style={{ color: ASK_COLOR, backgroundColor: "rgba(239,83,80,0.15)" }}
        >
          {formatDepthVolume(depthData.maxAskVolume)}
        </div>
      )}
    </div>
  );
};
