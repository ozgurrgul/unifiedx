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
import type { UseSpotExchangeDataInput, UseSpotExchangeDataOutput } from "../types";
import { useIgnoreWebSocketClose } from "../useIgnoreWebSocketClose";
import type {
  Binance24hTickerPrice,
  BinanceBookApiResponse,
  BinanceDepthWs,
  BinanceMarket,
  BinanceTradeApi,
  BinanceTradeWs,
  WsResponses,
} from "./types";

function arrayToHashmapByMarket<T extends { market: string }>(
  array: T[]
): Record<string, T> {
  const dict: Record<string, T> = {};
  for (const item of array) {
    dict[item.market] = item;
  }
  return dict;
}

const BINANCE_API_BASE_URL = "https://api.binance.com/api/v3";

function getBinanceStreams(market: SpotMarket) {
  const symbol = `${market.base.symbol}${market.quote.symbol}`.toLowerCase();
  return {
    trade: `${symbol}@trade`,
    depth: `${symbol}@depth@100ms`,
  };
}

export const loadSpotMarkets = (): Promise<SpotMarketsHashmap> => {
  return fetch(`${BINANCE_API_BASE_URL}/exchangeInfo`)
    .then((r) => r.json())
    .then((r) => {
      const config: {
        symbols: BinanceMarket[];
      } = r;

      const mappedMarkets: SpotMarketsHashmap = arrayToHashmapByMarket(
        config.symbols
          .filter((p) => p.status === "TRADING")
          .map((p) => {
            const market: SpotMarket = {
              market: `${p.baseAsset}-${p.quoteAsset}`,
              brandSymbol: p.symbol,
              base: {
                symbol: p.baseAsset,
                precision: p.baseAssetPrecision,
              },
              quote: {
                symbol: p.quoteAsset,
                precision: p.quoteAssetPrecision,
              },
              orderCapabilities: {
                marketOrder: {
                  active: p.orderTypes.includes("MARKET"),
                },
                limitOrder: {
                  active:
                    p.orderTypes.includes("LIMIT") ||
                    // TODO check difference between binance LIMIT vs LIMIT_MAKER
                    p.orderTypes.includes("LIMIT_MAKER"),
                },
              },
            };
            return market;
          })
      );

      return mappedMarkets;
    });
};

const getTrades = (activeSpotMarket: SpotMarket) => {
  return fetch(
    `${BINANCE_API_BASE_URL}/trades?symbol=${activeSpotMarket.base.symbol}${activeSpotMarket.quote.symbol}`
  )
    .then((r) => r.json())
    .then((r) => {
      const config: BinanceTradeApi[] = r;
      const mappedTrades: Trade[] = config.map((p) => {
        const trade: Trade = {
          market: activeSpotMarket,
          amount: p.qty,
          id: p.id,
          price: p.price,
          side: p.isBuyerMaker ? "sell" : "buy",
          timestamp: p.time,
        };
        return trade;
      });
      return mappedTrades;
    });
};

const getTickers = (markets: SpotMarketsHashmap) => {
  return fetch(`${BINANCE_API_BASE_URL}/ticker/24hr`)
    .then((r) => r.json())
    .then((r) => {
      const config: Binance24hTickerPrice[] = r;
      const marketsArr = Object.values(markets);

      const mappedTickers: TickersHashmap = arrayToHashmapByMarket(
        config.map((p) => {
          const market = marketsArr.find((m) => m.brandSymbol === p.symbol)?.market;

          if (!market) {
            // console.error("unknown market mapping", p.symbol);
          }

          const ticker: Ticker = {
            market: market || "UNKNOWN",
            last: p.lastPrice,
            volume: p.volume,
            volumeQuote: p.quoteVolume,
            bid: p.bidPrice,
            ask: "",
            high: "",
            low: "",
            open: "",
          };
          return ticker;
        })
      );

      return mappedTickers;
    });
};

const getBook = (activeSpotMarket: SpotMarket) => {
  return fetch(
    `${BINANCE_API_BASE_URL}/depth?symbol=${activeSpotMarket.base.symbol}${activeSpotMarket.quote.symbol}`
  )
    .then((r) => r.json())
    .then((r) => {
      const config: BinanceBookApiResponse = r;
      const mappedBook: BookData = {
        asks: config.asks,
        bids: config.bids,
        market: activeSpotMarket,
      };
      return mappedBook;
    });
};

export const useBinanceData = ({
  activeSpotMarket,
  setters,
  isCredentialsProvided,
  credentials,
}: UseSpotExchangeDataInput): UseSpotExchangeDataOutput => {
  const {
    setPrices,
    setTickers,
    setInitialTrades,
    addTrade,
    setBookData,
    addBookData,
    markets,
    setConnected,
    setError,
  } = setters;

  const subscribedStreamsRef = useRef<{ trade: string; depth: string } | null>(null);
  const { markClosing, shouldIgnoreClose } = useIgnoreWebSocketClose();

  const subscribeBinanceStreams = (market: SpotMarket) => {
    const streams = getBinanceStreams(market);
    sendJsonMessage({
      method: "SUBSCRIBE",
      params: [streams.trade, streams.depth],
      id: Date.now(),
    });
    subscribedStreamsRef.current = streams;
  };

  const unsubscribeBinanceStreams = (streams: { trade: string; depth: string }) => {
    sendJsonMessage({
      method: "UNSUBSCRIBE",
      params: [streams.trade, streams.depth],
      id: Date.now(),
    });
  };

  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket<WsResponses>("wss://stream.binance.com:443/stream", {
      onOpen: () => {
        setConnected(true);
        subscribeBinanceStreams(activeSpotMarket);
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
    }

    if (readyState === ReadyState.OPEN) {
      if (previousMarket && subscribedStreamsRef.current) {
        unsubscribeBinanceStreams(subscribedStreamsRef.current);
      }
      if (nextMarket) {
        subscribeBinanceStreams(nextMarket);
      }
    }
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    const msg = lastJsonMessage;
    const streams = getBinanceStreams(activeSpotMarket);
    // Handle trade
    if (msg.stream === streams.trade) {
      const data = msg.data as BinanceTradeWs["data"];
      const mapped: Trade = {
        amount: data.q,
        price: data.p,
        timestamp: data.E,
        market: activeSpotMarket,
        id: data.t,
        side: data.m ? "sell" : "buy",
      };
      addTrade(mapped);
    } else if (msg.stream === streams.depth) {
      const data = msg.data as BinanceDepthWs["data"];
      const mapped: BookData = {
        asks: data.a,
        bids: data.b,
        market: activeSpotMarket,
      };
      addBookData(mapped);
    }
  }, [lastJsonMessage]);

  const cancelOrder = (order: Order) => {};

  const createOrder = (payload: CreateOrderPayload) => {};

  const disconnect = () => {
    markClosing();
    getWebSocket()?.close();
  };

  return {
    readyState,
    onSpotMarketChange,
    disconnect,
    mutations: {
      cancelOrder,
      createOrder,
    },
  };
};
