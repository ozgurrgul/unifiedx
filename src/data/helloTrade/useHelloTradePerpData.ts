import { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { ReadyState } from "react-use-websocket/dist/lib/constants";
import type {
  BookData,
  CreateOrderPayload,
  Order,
  PerpMarket,
  PerpMarketsHashmap,
  Ticker,
  Trade,
} from "@/types/lib";
import type { UseSpotExchangeDataInput, UseSpotExchangeDataOutput } from "../spot/types";
import { useIgnoreWebSocketClose } from "../useIgnoreWebSocketClose";
import { HELLO_TRADE_MARKET_DATA_WS } from "./constants";
import type {
  HelloTradeMarketDataMessage,
  HelloTradeOrderBookLevel,
  HelloTradeTickerData,
  HelloTradeTradeData,
} from "./types";

export { loadHelloTradePerpMarkets } from "./loadHelloTradePerpMarkets";

function symbolForMarket(market: PerpMarket): string {
  return market.brandSymbol;
}

function toBookEntries(levels: HelloTradeOrderBookLevel[]): BookData["bids"] {
  return levels.map((level) => [level.price, level.quantity]);
}

function mapTicker(row: HelloTradeTickerData, markets: PerpMarketsHashmap): Ticker | null {
  const marketEntry = Object.values(markets).find((m) => m.brandSymbol === row.symbol);
  if (!marketEntry) {
    return null;
  }
  return {
    market: marketEntry.market,
    last: row.lastPrice,
    bid: row.bidPrice,
    ask: row.askPrice,
    open: row.openingPrice,
    high: row.high,
    low: row.low,
    volume: row.volume,
    volumeQuote: row.quoteVolume,
    markPrice: row.markPrice,
    indexPrice: row.indexPrice,
    fundingRate: row.fundingRate,
    nextFundingTimeMs: row.nextFundingTime,
  };
}

export const useHelloTradePerpData = ({
  activeSpotMarket,
  setters,
}: UseSpotExchangeDataInput): UseSpotExchangeDataOutput => {
  const {
    patchTicker,
    setInitialTrades,
    addTrade,
    setBookData,
    beginActiveMarketChange,
    markets,
    setConnected,
    setError,
  } = setters;

  const activeSymbolRef = useRef(symbolForMarket(activeSpotMarket));
  const tickerSymbolsSubscribedRef = useRef(false);
  const lastTradePriceRef = useRef<number | null>(null);
  const tradesSnapshotRef = useRef<Trade[]>([]);
  const tradesSnapshotActiveRef = useRef(true);
  const { markClosing, shouldIgnoreClose } = useIgnoreWebSocketClose();

  const sendSubscribe = (
    sendJsonMessage: (msg: object) => void,
    channel: string,
    symbols: string[],
    extra?: Record<string, unknown>
  ) => {
    sendJsonMessage({
      type: "subscribe",
      channel,
      symbols,
      ...extra,
    });
  };

  const sendUnsubscribe = (
    sendJsonMessage: (msg: object) => void,
    channel: string,
    symbols: string[]
  ) => {
    sendJsonMessage({
      type: "unsubscribe",
      channel,
      symbols,
    });
  };

  const subscribeActiveMarket = (symbol: string, sendJsonMessage: (msg: object) => void) => {
    sendSubscribe(sendJsonMessage, "orderbook", [symbol], {
      levels: 20,
      orderbookInterval: 100,
    });
    sendSubscribe(sendJsonMessage, "trades", [symbol], { limit: 100 });
  };

  const unsubscribeActiveMarket = (symbol: string, sendJsonMessage: (msg: object) => void) => {
    sendUnsubscribe(sendJsonMessage, "orderbook", [symbol]);
    sendUnsubscribe(sendJsonMessage, "trades", [symbol]);
  };

  const subscribeAllTickers = (sendJsonMessage: (msg: object) => void) => {
    const symbols = Object.values(markets).map((m) => m.brandSymbol);
    if (symbols.length === 0) {
      return;
    }
    sendSubscribe(sendJsonMessage, "ticker", symbols, { interval: 1000 });
    tickerSymbolsSubscribedRef.current = true;
  };

  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket(HELLO_TRADE_MARKET_DATA_WS, {
      onOpen: () => {
        setConnected(true);
        subscribeAllTickers(sendJsonMessage);
        subscribeActiveMarket(activeSymbolRef.current, sendJsonMessage);
        sendSubscribe(sendJsonMessage, "ticker", [activeSymbolRef.current], {
          interval: 1000,
        });
      },
      onError: () => {
        setConnected(false);
        setError({ error: "Failed to connect to Hello Trade market data" });
      },
      onClose: () => {
        setConnected(false);
        if (shouldIgnoreClose()) {
          return;
        }
        setError({ error: "Hello Trade market data WebSocket closed" });
      },
    });

  const onSpotMarketChange = (nextMarket: PerpMarket, previousMarket?: PerpMarket) => {
    activeSymbolRef.current = symbolForMarket(nextMarket);
    tradesSnapshotRef.current = [];
    tradesSnapshotActiveRef.current = true;
    lastTradePriceRef.current = null;
    beginActiveMarketChange();

    if (readyState === ReadyState.OPEN) {
      if (previousMarket) {
        unsubscribeActiveMarket(symbolForMarket(previousMarket), sendJsonMessage);
      }
      subscribeActiveMarket(activeSymbolRef.current, sendJsonMessage);
      sendSubscribe(sendJsonMessage, "ticker", [activeSymbolRef.current], {
        interval: 1000,
      });
    }
  };

  useEffect(() => {
    if (readyState !== ReadyState.OPEN || tickerSymbolsSubscribedRef.current) {
      return;
    }
    if (Object.keys(markets).length > 0) {
      subscribeAllTickers(sendJsonMessage);
    }
  }, [readyState, markets, sendJsonMessage]);

  useEffect(() => {
    const msg = lastJsonMessage as HelloTradeMarketDataMessage | null;
    if (!msg || msg.type !== "marketData" || !msg.data) {
      return;
    }

    const channel = msg.channel;
    const data = msg.data;

    if (channel === "ticker") {
      const row = data as unknown as HelloTradeTickerData;
      const ticker = mapTicker(row, markets as PerpMarketsHashmap);
      if (ticker) {
        patchTicker(ticker.market, ticker);
      }
      return;
    }

    if (channel === "orderbook") {
      const row = data as {
        symbol: string;
        bids: HelloTradeOrderBookLevel[];
        asks: HelloTradeOrderBookLevel[];
      };
      if (row.symbol !== activeSymbolRef.current) {
        return;
      }
      setBookData({
        bids: toBookEntries(row.bids ?? []),
        asks: toBookEntries(row.asks ?? []),
        market: activeSpotMarket,
      });
      return;
    }

    if (channel === "trades") {
      const row = data as unknown as HelloTradeTradeData;
      if (row.symbol !== activeSymbolRef.current) {
        return;
      }
      const qty = parseFloat(row.quantity);
      if (qty === 0) {
        if (tradesSnapshotRef.current.length > 0) {
          setInitialTrades([...tradesSnapshotRef.current].reverse());
        }
        tradesSnapshotRef.current = [];
        tradesSnapshotActiveRef.current = false;
        return;
      }
      const price = parseFloat(row.price);
      const side: Trade["side"] =
        lastTradePriceRef.current === null
          ? "buy"
          : price >= lastTradePriceRef.current
            ? "buy"
            : "sell";
      lastTradePriceRef.current = price;

      const mapped: Trade = {
        amount: row.quantity,
        price: row.price,
        timestamp: row.timestamp,
        market: activeSpotMarket,
        id: `${row.timestamp}-${row.price}-${row.quantity}`,
        side,
      };
      if (tradesSnapshotActiveRef.current) {
        tradesSnapshotRef.current.push(mapped);
      } else {
        addTrade(mapped);
      }
    }
  }, [
    lastJsonMessage,
    activeSpotMarket,
    markets,
    patchTicker,
    setBookData,
    addTrade,
    setInitialTrades,
  ]);

  useEffect(() => {
    lastTradePriceRef.current = null;
  }, [activeSpotMarket.market]);

  const cancelOrder = (_order: Order) => {};

  const createOrder = (_payload: CreateOrderPayload) => {
    setError({
      error:
        "Hello Trade order placement requires wallet signing (EIP-712). Not wired in UnifiedX yet.",
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
