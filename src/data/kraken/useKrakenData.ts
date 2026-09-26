import { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { ReadyState } from "react-use-websocket/dist/lib/constants";
import type {
  BookData,
  CreateOrderPayload,
  Market,
  MarketsHashmap,
  Order,
  Ticker,
  TickersHashmap,
  Trade,
} from "@/types/lib";
import { useIgnoreWebSocketClose } from "../useIgnoreWebSocketClose";
import type { UseExchangeDataInput, UseExchangeDataOutput } from "../types";
import type {
  KrakenAssetPairsResponse,
  KrakenDepthResponse,
  KrakenTickerResponse,
  KrakenTradesResponse,
  KrakenWsMessage,
} from "./types";

const KRAKEN_REST_BASE = "https://api.kraken.com/0/public";
const KRAKEN_WS_V2 = "wss://ws.kraken.com/v2";

const krakenPairAliasToMarket: Record<string, string> = {};

function arrayToHashmapByMarket<T extends { market: string }>(
  array: T[]
): Record<string, T> {
  const dict: Record<string, T> = {};
  for (const item of array) {
    dict[item.market] = item;
  }
  return dict;
}

export function normalizeKrakenSymbol(symbol: string): string {
  return symbol === "XBT" ? "BTC" : symbol;
}

function brandSymbolFromWsName(wsname: string): string {
  const [base, quote] = wsname.split("/");
  if (!base || !quote) {
    return wsname;
  }
  return `${normalizeKrakenSymbol(base)}/${quote}`;
}

function registerPairAliases(pairId: string, info: { altname: string; wsname?: string }, marketId: string) {
  krakenPairAliasToMarket[pairId] = marketId;
  krakenPairAliasToMarket[info.altname] = marketId;
  if (info.wsname) {
    krakenPairAliasToMarket[info.wsname] = marketId;
    krakenPairAliasToMarket[brandSymbolFromWsName(info.wsname)] = marketId;
  }
}

function assertKrakenOk<T extends { error: string[] }>(payload: T): T {
  if (payload.error?.length) {
    throw new Error(payload.error.join(", "));
  }
  return payload;
}

export const loadMarkets = (): Promise<MarketsHashmap> => {
  for (const key of Object.keys(krakenPairAliasToMarket)) {
    delete krakenPairAliasToMarket[key];
  }

  return fetch(`${KRAKEN_REST_BASE}/AssetPairs`)
    .then((r) => r.json())
    .then((raw) => {
      const config = assertKrakenOk(raw as KrakenAssetPairsResponse);
      const mappedMarkets: Market[] = [];

      for (const [pairId, info] of Object.entries(config.result)) {
        if (info.status && info.status !== "online") {
          continue;
        }
        if (!info.wsname) {
          continue;
        }

        const brandSymbol = brandSymbolFromWsName(info.wsname);
        const [baseSymbol, quoteSymbol] = brandSymbol.split("/");
        if (!baseSymbol || !quoteSymbol) {
          continue;
        }

        const marketId = `${baseSymbol}-${quoteSymbol}`;
        registerPairAliases(pairId, info, marketId);

        mappedMarkets.push({
          market: marketId,
          brandSymbol,
          base: {
            symbol: baseSymbol,
            precision: info.lot_decimals,
          },
          quote: {
            symbol: quoteSymbol,
            precision: info.pair_decimals,
          },
          orderCapabilities: {
            marketOrder: {
              active: true,
            },
            limitOrder: {
              active: true,
            },
          },
        });
      }

      return arrayToHashmapByMarket(mappedMarkets);
    });
};

const bookLevelsToEntries = (
  levels: { price: number; qty: number }[] | [string, string, number][]
): BookData["bids"] => {
  if (!levels?.length) {
    return [];
  }
  if (Array.isArray(levels[0])) {
    return (levels as [string, string, number][]).map(([price, qty]) => [price, qty]);
  }
  return (levels as { price: number; qty: number }[]).map((level) => [
    String(level.price),
    String(level.qty),
  ]);
};

const getTrades = (activeMarket: Market) => {
  return fetch(
    `${KRAKEN_REST_BASE}/Trades?pair=${encodeURIComponent(activeMarket.brandSymbol)}&count=100`
  )
    .then((r) => r.json())
    .then((raw) => {
      const config = assertKrakenOk(raw as KrakenTradesResponse);
      const pairKey = Object.keys(config.result).find((k) => k !== "last");
      const rows = pairKey ? config.result[pairKey] : [];
      if (!rows || !Array.isArray(rows)) {
        return [];
      }

      const mappedTrades: Trade[] = rows.map((row) => ({
        market: activeMarket,
        amount: row[1],
        id: String(row[6]),
        price: row[0],
        side: row[3] === "b" ? "buy" : "sell",
        timestamp: Math.floor(row[2] * 1000),
      }));

      return mappedTrades.reverse();
    });
};

const getTickers = (markets: MarketsHashmap) => {
  return fetch(`${KRAKEN_REST_BASE}/Ticker`)
    .then((r) => r.json())
    .then((raw) => {
      const config = assertKrakenOk(raw as KrakenTickerResponse);
      const mappedTickers: Ticker[] = [];

      for (const [pairKey, row] of Object.entries(config.result)) {
        const marketId = krakenPairAliasToMarket[pairKey];
        if (!marketId || !markets[marketId]) {
          continue;
        }

        mappedTickers.push({
          market: marketId,
          last: row.c[0],
          volume: row.v[0],
          volumeQuote: row.v[1],
          bid: row.b[0],
          ask: row.a[0],
          high: row.h[1],
          low: row.l[1],
          open: row.o,
        });
      }

      return arrayToHashmapByMarket(mappedTickers);
    });
};

const getBook = (activeMarket: Market) => {
  return fetch(
    `${KRAKEN_REST_BASE}/Depth?pair=${encodeURIComponent(activeMarket.brandSymbol)}&count=100`
  )
    .then((r) => r.json())
    .then((raw) => {
      const config = assertKrakenOk(raw as KrakenDepthResponse);
      const pairKey = Object.keys(config.result)[0];
      const book = pairKey ? config.result[pairKey] : undefined;
      const mappedBook: BookData = {
        asks: bookLevelsToEntries(book?.asks ?? []),
        bids: bookLevelsToEntries(book?.bids ?? []),
        market: activeMarket,
      };
      return mappedBook;
    });
};

function subscribeKrakenMarket(sendJsonMessage: (msg: object) => void, symbol: string) {
  sendJsonMessage({
    method: "subscribe",
    params: {
      channel: "trade",
      symbol: [symbol],
      snapshot: true,
    },
  });
  sendJsonMessage({
    method: "subscribe",
    params: {
      channel: "book",
      symbol: [symbol],
      depth: 25,
      snapshot: true,
    },
  });
}

function unsubscribeKrakenMarket(sendJsonMessage: (msg: object) => void, symbol: string) {
  sendJsonMessage({
    method: "unsubscribe",
    params: {
      channel: "trade",
      symbol: [symbol],
    },
  });
  sendJsonMessage({
    method: "unsubscribe",
    params: {
      channel: "book",
      symbol: [symbol],
    },
  });
}

export const useKrakenData = ({
  activeMarket,
  setters,
}: UseExchangeDataInput): UseExchangeDataOutput => {
  const {
    setTickers,
    setInitialTrades,
    addTrade,
    setBookData,
    addBookData,
    markets,
    setConnected,
    setError,
  } = setters;

  const subscribedSymbolRef = useRef<string | null>(null);
  const { markClosing, shouldIgnoreClose } = useIgnoreWebSocketClose();

  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket<KrakenWsMessage>(KRAKEN_WS_V2, {
      onOpen: () => {
        setConnected(true);
        if (activeMarket.brandSymbol) {
          subscribeKrakenMarket(sendJsonMessage, activeMarket.brandSymbol);
          subscribedSymbolRef.current = activeMarket.brandSymbol;
        }
      },
      onError: () => {
        setConnected(false);
        setError({ error: "Failed to connect to websocket" });
      },
      onClose: () => {
        setConnected(false);
        subscribedSymbolRef.current = null;
        if (shouldIgnoreClose()) {
          return;
        }
        setError({ error: "Websocket closed" });
      },
    });

  const syncWsSubscription = (nextMarket: Market, previousMarket?: Market) => {
    if (readyState !== ReadyState.OPEN) {
      return;
    }
    const nextSymbol = nextMarket.brandSymbol;
    const prevSymbol = previousMarket?.brandSymbol;
    if (prevSymbol && prevSymbol !== nextSymbol) {
      unsubscribeKrakenMarket(sendJsonMessage, prevSymbol);
    }
    if (nextSymbol && subscribedSymbolRef.current !== nextSymbol) {
      subscribeKrakenMarket(sendJsonMessage, nextSymbol);
      subscribedSymbolRef.current = nextSymbol;
    }
  };

  const onMarketChange = (market: Market, previousMarket?: Market) => {
    syncWsSubscription(market, previousMarket);
    getTickers(markets).then(setTickers);
    getBook(market).then(setBookData);
    getTrades(market).then(setInitialTrades);
  };

  useEffect(() => {
    if (!lastJsonMessage || typeof lastJsonMessage !== "object") {
      return;
    }
    const msg = lastJsonMessage;
    if (!("channel" in msg)) {
      return;
    }

    if (msg.channel === "trade" && msg.type === "update") {
      for (const row of msg.data) {
        if (row.symbol !== activeMarket.brandSymbol) {
          continue;
        }
        const mapped: Trade = {
          amount: String(row.qty),
          price: String(row.price),
          timestamp: Date.parse(row.timestamp),
          market: activeMarket,
          id: row.trade_id,
          side: row.side,
        };
        addTrade(mapped);
      }
      return;
    }

    if (msg.channel === "book" && (msg.type === "snapshot" || msg.type === "update")) {
      for (const row of msg.data) {
        if (row.symbol !== activeMarket.brandSymbol) {
          continue;
        }
        const mapped: BookData = {
          asks: bookLevelsToEntries(row.asks),
          bids: bookLevelsToEntries(row.bids),
          market: activeMarket,
        };
        if (msg.type === "snapshot") {
          setBookData(mapped);
        } else {
          addBookData(mapped);
        }
      }
    }
  }, [lastJsonMessage, activeMarket, addTrade, addBookData, setBookData]);

  const cancelOrder = (_order: Order) => {};

  const createOrder = (_payload: CreateOrderPayload) => {};

  const disconnect = () => {
    markClosing();
    getWebSocket()?.close();
  };

  return {
    readyState,
    onMarketChange,
    disconnect,
    mutations: {
      cancelOrder,
      createOrder,
    },
  };
};
