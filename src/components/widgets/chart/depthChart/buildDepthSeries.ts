import type { ShapedBookEntry } from "../../orderBook/types";

export type DepthPoint = [number, number];

const isValidEntry = (entry: ShapedBookEntry) =>
  parseFloat(entry.p) > 0 && parseFloat(entry.a) > 0;

export type DepthSeriesResult = {
  bids: DepthPoint[];
  asks: DepthPoint[];
  midPrice: number;
  bestBidPrice: number;
  bestAskPrice: number;
  xMin: number;
  xMax: number;
  maxBidVolume: number;
  maxAskVolume: number;
};

/**
 * Standard exchange depth chart:
 * - Symmetric price range centred on mid
 * - Bids: high volume plateau on the left, tapering to 0 at mid
 * - Asks: 0 at mid, rising to a plateau on the right
 */
export const buildDepthSeries = (
  bidEntries: ShapedBookEntry[],
  askEntries: ShapedBookEntry[],
  midPriceHint?: number
): DepthSeriesResult => {
  const validBids = bidEntries.filter(isValidEntry);
  const asksBestFirst = [...askEntries.filter(isValidEntry)].sort(
    (a, b) => parseFloat(a.p) - parseFloat(b.p)
  );

  const bestBidPrice = validBids.length ? parseFloat(validBids[0].p) : 0;
  const bestAskPrice = asksBestFirst.length ? parseFloat(asksBestFirst[0].p) : 0;

  const midPrice =
    midPriceHint && midPriceHint > 0
      ? midPriceHint
      : bestBidPrice && bestAskPrice
        ? (bestBidPrice + bestAskPrice) / 2
        : bestBidPrice || bestAskPrice;

  // Bids: accumulate from best bid outward, sort ascending (low price → high price)
  let cumulative = 0;
  const bidPoints: DepthPoint[] = [];
  for (const entry of validBids) {
    cumulative += parseFloat(entry.a);
    bidPoints.push([parseFloat(entry.p), cumulative]);
  }
  bidPoints.sort((a, b) => a[0] - b[0]);
  const maxBidVolume = bidPoints.length ? bidPoints[0][1] : 0;

  // Asks: accumulate from best ask outward (ascending price)
  cumulative = 0;
  const askPoints: DepthPoint[] = [];
  for (const entry of asksBestFirst) {
    cumulative += parseFloat(entry.a);
    askPoints.push([parseFloat(entry.p), cumulative]);
  }
  const maxAskVolume = askPoints.length ? askPoints[askPoints.length - 1][1] : 0;

  const lowestBid = bidPoints.length ? bidPoints[0][0] : midPrice;
  const highestAsk = askPoints.length ? askPoints[askPoints.length - 1][0] : midPrice;

  // Symmetric range around mid — same as Kraken/Binance/etc.
  const bidSpan = midPrice - lowestBid;
  const askSpan = highestAsk - midPrice;
  const halfSpan = Math.max(bidSpan, askSpan, midPrice * 1e-6) * 1.02;
  const xMin = midPrice - halfSpan;
  const xMax = midPrice + halfSpan;

  // Bids: plateau at left edge → steps down → 0 at mid
  if (bidPoints.length > 0) {
    if (xMin < bidPoints[0][0]) {
      bidPoints.unshift([xMin, maxBidVolume]);
    }
    if (midPrice > bestBidPrice) {
      bidPoints.push([midPrice, 0]);
    }
  }

  // Asks: 0 at mid → steps up → plateau at right edge
  if (askPoints.length > 0) {
    if (midPrice < bestAskPrice) {
      askPoints.unshift([midPrice, 0]);
    } else {
      askPoints.unshift([bestAskPrice, 0]);
    }
    if (xMax > askPoints[askPoints.length - 1][0]) {
      askPoints.push([xMax, maxAskVolume]);
    }
  }

  return {
    bids: bidPoints,
    asks: askPoints,
    midPrice,
    bestBidPrice,
    bestAskPrice,
    xMin,
    xMax,
    maxBidVolume,
    maxAskVolume,
  };
};

export const formatDepthVolume = (value: number): string => {
  if (value === 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(0)}K`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(3);
  return value.toFixed(4);
};

export const formatDepthPrice = (value: number, precision: number): string => {
  const maxFrac = Math.min(precision, 6);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  });
};

export const getVolumeAxisMax = (
  maxBidVolume: number,
  maxAskVolume: number
): number => {
  const peak = Math.max(maxBidVolume, maxAskVolume);
  return peak > 0 ? peak * 1.05 : 1;
};
