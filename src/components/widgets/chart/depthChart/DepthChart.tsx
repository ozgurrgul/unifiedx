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

  const options: Options = {
    chart: {
      type: "area",
      // zoomType: "xy",
      backgroundColor: "transparent",
    },
    title: {
      text: "",
    },
    xAxis: {
      minPadding: 0,
      maxPadding: 0,
      lineColor: "transparent",
      title: {
        text: `Price`,
        style: {
          color: "var(--number)",
        },
      },
      labels: {
        style: {
          color: "var(--number)",
        },
      },
    },
    yAxis: [
      {
        lineWidth: 1,
        gridLineWidth: 0,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: "inside",
        lineColor: "transparent",
        labels: {
          align: "left",
          x: 8,
          style: {
            color: "var(--number)",
          },
        },
      },
      {
        opposite: true,
        linkedTo: 0,
        lineWidth: 1,
        gridLineWidth: 0,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: "inside",
        lineColor: "transparent",
        labels: {
          align: "right",
          x: -8,
          style: {
            color: "var(--number)",
          },
        },
      },
    ],
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.2,
        lineWidth: 1,
        step: "center",
      },
    },
    tooltip: {
      headerFormat: `<span style="font-size=10px;">Price: {point.key} ${quote.symbol}</span><br/>`,
      valueDecimals: 2,
      valueSuffix: base?.symbol,
    },
    series: [
      {
        name: "Bids",
        data: createBidsSeriesData(
          bookData?.bids || [],
          bookData?.midMarketPrice || 0
        ),
        color: "green",
        type: "area",
      },
      {
        name: "Asks",
        data: createAsksSeriesData(
          bookData?.asks || [],
          bookData?.midMarketPrice || 0
        ),
        color: "red",
        type: "area",
      },
    ],
  };

  return (
    <div key={bookData.market}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate
      />
    </div>
  );
};
