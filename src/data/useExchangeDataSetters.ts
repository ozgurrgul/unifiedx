import { useEffect, useRef, useState } from "react";
import type { ComputedOrderBookData } from "@/components/widgets/orderBook/types";
import type {
  BalancesHashmap,
  BookData,
  Order,
  PricesHashmap,
  SpotMarketsHashmap,
  Ticker,
  TickersHashmap,
  Trade,
} from "@/types/lib";
import type { BookWorkerPayload } from "../../workers/BookWorkerTypes";
import { MAX_TRADES_BUFFER } from "./constants";

export type UseSpotExchangeDataSettersInput = {
  activeSpotMarketId: string;
};

export const useExchangeDataSetters = ({
  activeSpotMarketId,
}: UseSpotExchangeDataSettersInput) => {
  const workerRef = useRef<Worker>();
  const [connected, setConnected] = useState<boolean>(false);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [markets, setMarkets] = useState<SpotMarketsHashmap>({});
  const [prices, setPrices] = useState<PricesHashmap>({});
  const [tickers, _setTickers] = useState<TickersHashmap>({});

  const [initialTradesLoading, setInitialTradesLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const [visibleOrderBookRows, setVisibleOrderBookRows] = useState(0); /** per side */

  const [orderBookLoading, setOrderBookLoading] = useState(true);
  const [computedOrderBookData, setComputedOrderBookData] =
    useState<ComputedOrderBookData>();

  const [allComputedOrderBookData, setAllComputedOrderBookData] =
    useState<ComputedOrderBookData>();

  const [cancellingOrderIds, setCancellingOrderIdsState] = useState<string[]>([]);

  const [error, setError] = useState<{ error: string }>();
  const [isAuthenticated, setAuthenticated] = useState<"no" | "loading" | "yes">("no");

  const [balances, setBalances] = useState<BalancesHashmap>({});

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../workers/book-worker.ts", import.meta.url)
    );
    workerRef.current.onmessage = (
      event: MessageEvent<{
        all: ComputedOrderBookData;
        limited: ComputedOrderBookData;
      }>
    ) => {
      setComputedOrderBookData(event.data.limited);
      setAllComputedOrderBookData(event.data.all);
      setOrderBookLoading(false);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const setTickers = (data: TickersHashmap) => {
    _setTickers(data);

    const newBulkPrices: PricesHashmap = {};
    for (const market in data) {
      newBulkPrices[market] = {
        market,
        price: data[market].last,
      };
    }
    setPrices((prev) => ({
      ...prev,
      ...newBulkPrices,
    }));
  };

  const patchTicker = (market: string, patch: Partial<Ticker>) => {
    _setTickers((prev) => {
      const existing = prev[market] ?? {
        market,
        last: "",
        ask: "",
        bid: "",
        high: "",
        low: "",
        open: "",
        volume: "",
        volumeQuote: "",
      };
      return { ...prev, [market]: { ...existing, ...patch } };
    });
  };

  const addTrade = (trade: Trade) => {
    if (trade.market.market !== activeSpotMarketId) {
      return;
    }
    setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES_BUFFER));
  };

  const setInitialTrades = (trades: Trade[]) => {
    setTrades(trades);
    setInitialTradesLoading(false);
  };

  const setBookData = (data: BookData) => {
    if (data.market.market !== activeSpotMarketId) {
      return;
    }
    workerRef.current?.postMessage({
      type: "snapshot",
      bookData: data,
      visibleRows: visibleOrderBookRows,
      quoteAssetPrecision: markets[activeSpotMarketId]?.quote.precision,
    } satisfies BookWorkerPayload);
  };

  const addBookData = (data: BookData) => {
    if (data.market.market !== activeSpotMarketId) {
      return;
    }
    workerRef.current?.postMessage({
      type: "update",
      bookData: data,
      visibleRows: visibleOrderBookRows,
      quoteAssetPrecision: markets[activeSpotMarketId]?.quote.precision,
    } satisfies BookWorkerPayload);
  };

  const updateVisibleOrderBookRowsNumber = (n: number) => {
    setVisibleOrderBookRows(n);
  };

  const addCancellingOrderIds = (ids: string[]) => {
    setCancellingOrderIdsState((prev) => [...prev, ...ids]);
  };

  const removeCancellingOrderIds = (ids: string[]) => {
    setCancellingOrderIdsState((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const setInitialMarkets = (markets: SpotMarketsHashmap) => {
    setMarkets(markets);
    setMarketsLoading(false);
  };

  return {
    connected,
    markets,
    prices,
    trades,
    tickers,
    openOrders,
    pastOrders,
    computedOrderBookData,
    allComputedOrderBookData,
    cancellingOrderIds,
    error,
    balances,
    isAuthenticated,
    initialTradesLoading,
    orderBookLoading,
    marketsLoading,
    setInitialTrades,
    setInitialMarkets,
    setPrices,
    setTickers,
    patchTicker,
    addTrade,
    setBookData,
    addBookData,
    updateVisibleOrderBookRowsNumber,
    setOpenOrders,
    setPastOrders,
    addCancellingOrderIds,
    removeCancellingOrderIds,
    setError,
    setBalances,
    setAuthenticated,
    setConnected,
  };
};
