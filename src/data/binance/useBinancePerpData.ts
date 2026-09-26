import { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { ReadyState } from "react-use-websocket/dist/lib/constants";
import type {
  BookData,
  CreateOrderPayload,
  Order,
  SpotMarket,
  SpotMarketsHashmap,
  Ticker,
  TickersHashmap,
  Trade,
} from "@/types/lib";
import type { UseSpotExchangeDataInput, UseSpotExchangeDataOutput } from "../spot/types";
import { useIgnoreWebSocketClose } from "../useIgnoreWebSocketClose";
import type { BinanceDepthWs, BinanceMarkPriceWs, BinanceTradeWs, WsResponses } from "./types";

const FAPI_BASE = "https://fapi.binance.com/fapi/v1";
const FSTREAM = "wss://fstream.binance.com/stream";

type FuturesSymbol = {
  symbol: string;
  pair: string;
  contractType: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  filters: Array<{ filterType: string; stepSize?: string; tickSize?: string }>;
};

function arrayToHashmapByMarket<T extends { market: string }>(
  array: T[]
): Record<string, T> {
  const dict: Record<string, T> = {};
  for (const item of array) {
    dict[item.market] = item;
  }
  return dict;
}

function precisionFromStep(step?: string): number {
  if (!step) {
    return 8;
  }
  const parts = step.split(".");
  if (parts.length < 2) {
    return 0;
  }
  return parts[1].replace(/0+$/, "").length || parts[1].length;
}

function getFuturesStreams(market: SpotMarket) {
  const symbol = market.brandSymbol.toLowerCase();
  return {
    trade: `${symbol}@aggTrade`,
    depth: `${symbol}@depth@100ms`,
    markPrice: `${symbol}@markPrice@1s`,
  };
}

export const loadBinancePerpMarkets = (): Promise<SpotMarketsHashmap> => {
  return fetch(`${FAPI_BASE}/exchangeInfo`)
    .then((r) => r.json())
    .then((r: { symbols: FuturesSymbol[] }) => {
      const mappedMarkets: SpotMarketsHashmap = arrayToHashmapByMarket(
        r.symbols
          .filter(
            (s) =>
              s.status === "TRADING" &&
              s.contractType === "PERPETUAL" &&
              s.quoteAsset === "USDT"
          )
          .map((s) => {
            const lot = s.filters.find((f) => f.filterType === "LOT_SIZE");
            const price = s.filters.find((f) => f.filterType === "PRICE_FILTER");
            const market: SpotMarket = {
              market: `${s.baseAsset}-${s.quoteAsset}`,
              brandSymbol: s.symbol,
              base: {
                symbol: s.baseAsset,
                precision: precisionFromStep(lot?.stepSize) || s.quantityPrecision,
              },
              quote: {
                symbol: s.quoteAsset,
                precision: precisionFromStep(price?.tickSize) || s.pricePrecision,
              },
              orderCapabilities: {
                marketOrder: { active: true },
                limitOrder: { active: true },
              },
            };
            return market;
          })
      );
      return mappedMarkets;
    });
};

const getTrades = (activeSpotMarket: SpotMarket) => {
  return fetch(`${FAPI_BASE}/trades?symbol=${activeSpotMarket.brandSymbol}&limit=100`)
    .then((r) => r.json())
    .then((rows: Array<{ id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }>) =>
      rows.map((p) => ({
        market: activeSpotMarket,
        amount: p.qty,
        id: p.id,
        price: p.price,
        side: p.isBuyerMaker ? ("sell" as const) : ("buy" as const),
        timestamp: p.time,
      }))
    );
};

type BinanceFutures24hTicker = {
  symbol: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  bidPrice: string;
  askPrice: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
};

const getTickers = (markets: SpotMarketsHashmap) => {
  return fetch(`${FAPI_BASE}/ticker/24hr`)
    .then((r) => r.json())
    .then((rows: BinanceFutures24hTicker[]) => {
      const byBrand = Object.values(markets);
      const mappedTickers: TickersHashmap = arrayToHashmapByMarket(
        rows.map((p) => {
          const market = byBrand.find((m) => m.brandSymbol === p.symbol)?.market;
          const ticker: Ticker = {
            market: market || "UNKNOWN",
            last: p.lastPrice,
            volume: p.volume,
            volumeQuote: p.quoteVolume,
            bid: p.bidPrice,
            ask: p.askPrice,
            high: p.highPrice,
            low: p.lowPrice,
            open: p.openPrice,
          };
          return ticker;
        })
      );
      return mappedTickers;
    });
};

const getPremiumIndex = (activeSpotMarket: SpotMarket) => {
  return fetch(
    `${FAPI_BASE}/premiumIndex?symbol=${activeSpotMarket.brandSymbol}`
  )
    .then((r) => r.json())
    .then(
      (row: {
        markPrice: string;
        indexPrice: string;
        lastFundingRate: string;
        nextFundingTime: number;
      }) => ({
        markPrice: row.markPrice,
        indexPrice: row.indexPrice,
        fundingRate: row.lastFundingRate,
        nextFundingTimeMs: row.nextFundingTime,
      })
    );
};

const getBook = (activeSpotMarket: SpotMarket) => {
  return fetch(`${FAPI_BASE}/depth?symbol=${activeSpotMarket.brandSymbol}&limit=100`)
    .then((r) => r.json())
    .then((config: { asks: BookData["asks"]; bids: BookData["bids"] }) => ({
      asks: config.asks,
      bids: config.bids,
      market: activeSpotMarket,
    }));
};

export const useBinancePerpData = ({
  activeSpotMarket,
  setters,
  isCredentialsProvided,
}: UseSpotExchangeDataInput): UseSpotExchangeDataOutput => {
  const {
    setTickers,
    patchTicker,
    setInitialTrades,
    addTrade,
    setBookData,
    addBookData,
    markets,
    setConnected,
    setError,
  } = setters;

  const subscribedStreamsRef = useRef<{
    trade: string;
    depth: string;
    markPrice: string;
  } | null>(null);
  const { markClosing, shouldIgnoreClose } = useIgnoreWebSocketClose();

  const subscribeStreams = (market: SpotMarket) => {
    const streams = getFuturesStreams(market);
    sendJsonMessage({
      method: "SUBSCRIBE",
      params: [streams.trade, streams.depth, streams.markPrice],
      id: Date.now(),
    });
    subscribedStreamsRef.current = streams;
  };

  const unsubscribeStreams = (streams: {
    trade: string;
    depth: string;
    markPrice: string;
  }) => {
    sendJsonMessage({
      method: "UNSUBSCRIBE",
      params: [streams.trade, streams.depth, streams.markPrice],
      id: Date.now(),
    });
  };

  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket<WsResponses>(FSTREAM, {
      onOpen: () => {
        setConnected(true);
        subscribeStreams(activeSpotMarket);
      },
      onError: () => {
        setConnected(false);
        setError({ error: "Failed to connect to websocket" });
      },
      onClose: () => {
        setConnected(false);
        if (shouldIgnoreClose()) {
          return;
        }
        setError({ error: "Websocket closed" });
      },
    });

  const onSpotMarketChange = (nextMarket: SpotMarket, previousMarket?: SpotMarket) => {
    if (nextMarket) {
      getTickers(markets).then(setTickers);
      getBook(nextMarket).then(setBookData);
      getTrades(nextMarket).then(setInitialTrades);
      getPremiumIndex(nextMarket).then((perp) => {
        patchTicker(nextMarket.market, perp);
      });
    }

    if (readyState === ReadyState.OPEN) {
      if (previousMarket && subscribedStreamsRef.current) {
        unsubscribeStreams(subscribedStreamsRef.current);
      }
      if (nextMarket) {
        subscribeStreams(nextMarket);
      }
    }
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    const msg = lastJsonMessage;
    const streams = getFuturesStreams(activeSpotMarket);
    if (msg.stream === streams.trade) {
      const data = msg.data as BinanceTradeWs["data"];
      const mapped: Trade = {
        amount: data.q,
        price: data.p,
        timestamp: data.E,
        market: activeSpotMarket,
        id: (data as { a?: number; t: number }).a ?? data.t,
        side: data.m ? "sell" : "buy",
      };
      addTrade(mapped);
    } else if (msg.stream === streams.depth) {
      const data = msg.data as BinanceDepthWs["data"];
      addBookData({
        asks: data.a,
        bids: data.b,
        market: activeSpotMarket,
      });
    } else if (msg.stream === streams.markPrice) {
      const data = msg.data as BinanceMarkPriceWs["data"];
      patchTicker(activeSpotMarket.market, {
        markPrice: data.p,
        indexPrice: data.i,
        fundingRate: data.r,
        nextFundingTimeMs: data.T,
      });
    }
  }, [lastJsonMessage, activeSpotMarket, addTrade, addBookData, patchTicker]);

  const cancelOrder = (_order: Order) => {};

  const createOrder = (payload: CreateOrderPayload) => {
    if (!isCredentialsProvided) {
      return;
    }

    fetch("/api/gateway/binanceFutures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "placeOrder",
        symbol: activeSpotMarket.brandSymbol,
        side: payload.side,
        orderType: payload.type,
        quantity: payload.amount,
        price: payload.price,
      }),
    })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) {
          throw new Error(body.error || "Order failed");
        }
        setError(undefined);
      })
      .catch((e) => {
        setError({ error: e instanceof Error ? e.message : String(e) });
      });
  };

  const disconnect = () => {
    markClosing();
    getWebSocket()?.close();
  };

  return {
    readyState,
    onSpotMarketChange,
    disconnect,
    mutations: { cancelOrder, createOrder },
  };
};
