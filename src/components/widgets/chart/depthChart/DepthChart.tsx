"use client";

import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import React, { useContext } from "react";
import Highcharts, { Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { ShapedBookEntry } from "../../orderBook/types";

export const DepthChart = () => {
  const {
    getters: {
      activeMarket: { allComputedOrderBookData: bookData, base, quote },
    },
  } = useContext(ExchangeDataGettersContext);

  const createBidsSeriesData = (
    entries: ShapedBookEntry[],
    midMarketPrice: number
  ) => {
    let total = 0;
    return entries
      .filter((p) => parseFloat(p.p) > midMarketPrice / 2)
      .map((p) => {
        let a = parseFloat(p.a);
        total += a;
        return [parseFloat(p.p), total];
      });
  };

  const createAsksSeriesData = (
    entries: ShapedBookEntry[],
    midMarketPrice: number
  ) => {
    let total = 0;
    const t = entries
      .filter((p) => parseFloat(p.p) < midMarketPrice * 2)
      .map((p) => {
        let a = parseFloat(p.a);
        total += a;
        return [parseFloat(p.p), total];
      });

    return t?.map((row) => {
      return [row[0], total - row[1]];
    });
  };

  if (!bookData?.market) {
    return null;
  }

  const bids = bookData.bids || [];
  const asks = bookData.asks || [];

  // Calculate mid-market price
  const highestBid = bids.length > 0 ? parseFloat(bids[0].p) : 0;
  const lowestAsk = asks.length > 0 ? parseFloat(asks[0].p) : 0;
  const midMarketPrice = (highestBid + lowestAsk) / 2;

  // Create series data
  const bidsData = createBidsSeriesData(bids, midMarketPrice);
  const asksData = createAsksSeriesData(asks, midMarketPrice);

  const options: Options = {
    chart: {
      type: "area",
      backgroundColor: "transparent",
      animation: false,
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      title: {
        text: `Price (${quote.symbol})`,
        style: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      labels: {
        style: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      gridLineColor: "hsl(var(--border))",
      lineColor: "hsl(var(--border))",
      tickColor: "hsl(var(--border))",
    },
    yAxis: {
      title: {
        text: `Cumulative ${base?.symbol}`,
        style: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      labels: {
        style: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      gridLineColor: "hsl(var(--border))",
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.2,
        lineWidth: 2,
        animation: false,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 4,
            },
          },
        },
      },
    },
    series: [
      {
        name: "Bids",
        type: "area",
        data: bidsData,
        color: "#22c55e",
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, "rgba(34, 197, 94, 0.3)"],
            [1, "rgba(34, 197, 94, 0.05)"],
          ],
        },
      },
      {
        name: "Asks",
        type: "area",
        data: asksData,
        color: "#ef4444",
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, "rgba(239, 68, 68, 0.3)"],
            [1, "rgba(239, 68, 68, 0.05)"],
          ],
        },
      },
    ],
  };

  return (
    <div key={bookData.market} className="w-full h-full">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};
