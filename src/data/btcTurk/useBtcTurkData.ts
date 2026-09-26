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
import {
  DEFAULT_BASE_ASSET_PRECISION,
  DEFAULT_QUOTE_ASSET_PRECISION,
} from "../constants";
import type { UseSpotExchangeDataInput, UseSpotExchangeDataOutput } from "../types";
import { useIgnoreWebSocketClose } from "../useIgnoreWebSocketClose";
import type {
  BtcTurkBook,
  BtcTurkCurrency,
  BtcTurkSymbol,
  BtcTurkTicker,
  BtcTurkTrade,
  BtcTurkWsTradeSingle,
  WsResponses,
} from "./types";
import { btcTurkPairEvent, btcTurkSubscriptionMessage, mapBtcTurkWsTrade } from "./ws";

function arrayToHashmapByMarket<T extends { market: string }>(
  array: T[]
): Record<string, T> {
  const dict: Record<string, T> = {};
  for (const item of array) {
    dict[item.market] = item;
  }
  return dict;
}

export const loadSpotMarkets = (): Promise<SpotMarketsHashmap> => {
  return fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({ type: "/server/exchangeInfo" }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((r) => {
      const config: {
        data: {
          symbols: BtcTurkSymbol[];
          currencies: BtcTurkCurrency[];
        };
      } = r;

      const mappedMarkets: SpotMarketsHashmap = arrayToHashmapByMarket(
        config.data.symbols
          .filter((p) => p.status === "TRADING")
          .map((p) => {
            const baseCurrency = config.data.currencies.find(
              (r) => r.symbol === p.numerator
            );
            const quoteCurrency = config.data.currencies.find(
              (r) => r.symbol === p.denominator
            );
            const market: SpotMarket = {
              market: `${p.numerator}-${p.denominator}`,
              brandSymbol: p.nameNormalized,
              base: {
                symbol: p.numerator,
                precision: baseCurrency?.precision || DEFAULT_BASE_ASSET_PRECISION,
              },
              quote: {
                symbol: p.denominator,
                precision: quoteCurrency?.precision || DEFAULT_QUOTE_ASSET_PRECISION,
              },
              orderCapabilities: {
                marketOrder: {
                  active: p.orderMethods.includes("MARKET"),
                },
                limitOrder: {
                  active: p.orderMethods.includes("LIMIT"),
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
  return fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({
      type: "/trades",
      extra: {
        market: `${activeSpotMarket.base.symbol}${activeSpotMarket.quote.symbol}`,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((r) => r.data)
    .then((r) => {
      const config: BtcTurkTrade[] = r;
      if (!r) {
        return [];
      }
      const mappedTrades: Trade[] = config.map((p) => {
        const trade: Trade = {
          market: activeSpotMarket,
          amount: p.amount,
          id: `${p.tid}-${p.date}`,
          price: p.price,
          side: p.side,
          timestamp: p.date,
        };
        return trade;
      });
      return mappedTrades;
    });
};

const getTickers = (markets: SpotMarketsHashmap) => {
  return fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({
      type: "/ticker",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((r) => r.data)
    .then((r) => {
      const config: BtcTurkTicker[] = r;
      const marketsArr = Object.values(markets);

      const mappedTickers: TickersHashmap = arrayToHashmapByMarket(
        config.map((p) => {
          const market = marketsArr.find(
            (m) => m.brandSymbol === p.pairNormalized
          )?.market;

          if (!market) {
            console.error("unknown market mapping", p.pair);
          }

          const ticker: Ticker = {
            market: market || "UNKNOWN",
            last: String(p.last),
            volume: String(p.volume),
            volumeQuote: "",
            bid: String(p.bid),
            ask: String(p.ask),
            high: String(p.high),
            low: String(p.low),
            open: String(p.open),
          };
          return ticker;
        })
      );

      return mappedTickers;
    });
};

const getBook = (activeSpotMarket: SpotMarket) => {
  return fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({
      type: "/orderbook",
      extra: {
        market: `${activeSpotMarket.base.symbol}${activeSpotMarket.quote.symbol}`,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((r) => r.data)
    .then((r) => {
      const config: BtcTurkBook = r;
      const mappedBook: BookData = {
        asks: config.asks,
        bids: config.bids,
        market: activeSpotMarket,
      };
      return mappedBook;
    });
};

export const useBtcTurkData = ({
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
    setAuthenticated,
    setError,
    markets,
    setConnected,
  } = setters;

  const subscribedPairRef = useRef<string | null>(null);
  const { markClosing, shouldIgnoreClose } = useIgnoreWebSocketClose();

  const syncBtcTurkSubscriptions = (
    sendMessage: (msg: string) => void,
    nextMarket: SpotMarket,
    previousMarket?: SpotMarket
  ) => {
    if (previousMarket) {
      const prevEvent = btcTurkPairEvent(previousMarket);
      sendMessage(btcTurkSubscriptionMessage("trade", prevEvent, false));
      sendMessage(btcTurkSubscriptionMessage("orderbook", prevEvent, false));
    }

    const nextEvent = btcTurkPairEvent(nextMarket);
    sendMessage(btcTurkSubscriptionMessage("trade", nextEvent, true));
    sendMessage(btcTurkSubscriptionMessage("orderbook", nextEvent, true));
    subscribedPairRef.current = nextEvent;
  };

  const { lastJsonMessage, sendMessage, readyState, getWebSocket } = useWebSocket(
    "wss://ws-feed-pro.btcturk.com",
    {
      onOpen: () => {
        setConnected(true);
        syncBtcTurkSubscriptions(sendMessage, activeSpotMarket);
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
    }
  );

  const onSpotMarketChange = (nextMarket: SpotMarket, previousMarket?: SpotMarket) => {
    if (nextMarket) {
      getTickers(markets).then(setTickers);
      getBook(nextMarket).then(setBookData);
      getTrades(nextMarket).then(setInitialTrades);
    }

    if (readyState === ReadyState.OPEN) {
      syncBtcTurkSubscriptions(sendMessage, nextMarket, previousMarket);
    }
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    const msg = lastJsonMessage as WsResponses;
    if (!Array.isArray(msg)) {
      return;
    }

    const [code, payload] = msg;
    if (
      code === 114 &&
      payload &&
      typeof payload === "object" &&
      "message" in payload
    ) {
      setAuthenticated("no");
      setError({ error: String(payload.message) });
      return;
    }

    if (code === 421 && payload && typeof payload === "object") {
      const items =
        "items" in payload && Array.isArray(payload.items) ? payload.items : [];
      if (items.length > 0) {
        setInitialTrades(items.map((row) => mapBtcTurkWsTrade(row, activeSpotMarket)));
      }
      return;
    }

    if (
      code === 422 &&
      payload &&
      typeof payload === "object" &&
      "P" in payload &&
      "A" in payload
    ) {
      addTrade(mapBtcTurkWsTrade(payload as BtcTurkWsTradeSingle, activeSpotMarket));
      return;
    }

    if (code === 431 && payload && typeof payload === "object" && "AO" in payload) {
      setBookData({
        market: activeSpotMarket,
        asks: payload.AO.map((row) => [row.P, row.A]),
        bids: payload.BO.map((row) => [row.P, row.A]),
      });
      return;
    }

    if (code === 432 && payload && typeof payload === "object" && "AO" in payload) {
      const mapDiffSide = (rows: { P: string; A: string; CP: number }[]) =>
        rows.map((row) => [row.P, row.CP === 3 ? "0" : row.A] as [string, string]);

      addBookData({
        market: activeSpotMarket,
        asks: mapDiffSide(payload.AO),
        bids: mapDiffSide(payload.BO),
      });
    }
  }, [
    lastJsonMessage,
    activeSpotMarket,
    addTrade,
    setBookData,
    addBookData,
    setInitialTrades,
  ]);

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
