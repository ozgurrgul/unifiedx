import { ComputedOrderBookData } from "@/components/widgets/orderBook/types";
import {
  BalancesHashmap,
  BookData,
  MarketsHashmap,
  Order,
  PricesHashmap,
  TickersHashmap,
  Trade,
} from "@/types/lib";
import { useEffect, useRef, useState } from "react";

export type UseExchangeDataSettersInput = {
  activeMarket: string;
  onLayoutConfigure: () => void;
};

export const useExchangeDataSetters = ({
  activeMarket,
  onLayoutConfigure,
}: UseExchangeDataSettersInput) => {
  const workerRef = useRef<Worker>();
  const [connected, setConnected] = useState<boolean>(false);
  const [markets, setMarkets] = useState<MarketsHashmap>({});
  const [prices, setPrices] = useState<PricesHashmap>({});
  const [tickers, _setTickers] = useState<TickersHashmap>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const [visibleOrderBookRows, setVisibleOrderBookRows] =
    useState(0); /** per side */
  const [computedOrderBookData, setComputedOrderBookData] =
    useState<ComputedOrderBookData>();

  const [allComputedOrderBookData, setAllComputedOrderBookData] =
    useState<ComputedOrderBookData>();

  const [cancellingOrderIds, _setCancellingOrderIds] = useState<string[]>([]);

  const [error, setError] = useState<{ error: string }>();
  const [isAuthenticated, setAuthenticated] = useState<
    "no" | "loading" | "yes"
  >("no");

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

  const addTrade = (trade: Trade) => {
    if (trade.market.market !== activeMarket) {
      return;
    }
    setTrades([trade, ...(trades || [])]);
  };

  const setBookData = (data: BookData) => {
    if (data.market.market !== activeMarket) {
      return;
    }
    workerRef.current?.postMessage({
      type: "snapshot",
      bookData: data,
      visibleRows: visibleOrderBookRows,
    });
  };

  const addBookData = (data: BookData) => {
    if (data.market.market !== activeMarket) {
      return;
    }
    workerRef.current?.postMessage({
      type: "update",
      bookData: data,
      visibleRows: visibleOrderBookRows,
    });
  };

  const updateVisibleOrderBookRowsNumber = (n: number) => {
    setVisibleOrderBookRows(n);
  };

  useEffect(() => {
    if (visibleOrderBookRows > 0) {
      onLayoutConfigure();
    }
  }, [visibleOrderBookRows, onLayoutConfigure]);

  const addCancellingOrderIds = (ids: string[]) => {
    _setCancellingOrderIds((prev) => [...prev, ...ids]);
  };

  const removeCancellingOrderIds = (ids: string[]) => {
    _setCancellingOrderIds((prev) => prev.filter((id) => !ids.includes(id)));
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
    // TODO: order by time
    setInitialTrades: setTrades,
    setMarkets,
    setPrices,
    setTickers,
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
