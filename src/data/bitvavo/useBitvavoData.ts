import {
  BitvavoBalance,
  BitvavoMarket,
  BitvavoOrder,
  WsResponses,
} from "@/data/bitvavo/types";
import {
  Market,
  MarketsHashmap,
  Trade,
  Order,
  TickersHashmap,
  BalancesHashmap,
  CreateOrderPayload,
} from "@/types/lib";
import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import crypto from "crypto";
import { UseHookDataInput, UseHookDataOutput } from "../types";
import {
  DEFAULT_BASE_ASSET_PRECISION,
  DEFAULT_QUOTE_ASSET_PRECISION,
} from "../constants";

function arrayToHashmapByMarket<T extends { market: string }>(
  array: T[]
): Record<string, T> {
  const dict: Record<string, T> = {};
  for (const item of array) {
    dict[item.market] = item;
  }
  return dict;
}

export const loadMarkets = (): Promise<MarketsHashmap> => {
  return fetch("https://api.bitvavo.com/v2/markets")
    .then((r) => r.json())
    .then((r) => {
      if (r.error) {
        throw Error(r.error);
      }
      return arrayToHashmapByMarket(
        r
          .filter((p: BitvavoMarket) => p.status === "trading")
          .map((p: BitvavoMarket) => {
            return {
              market: p.market,
              brandSymbol: p.market,
              base: {
                symbol: p.market.split("-")[0],
                precision: p.quantityDecimals,
              },
              quote: {
                symbol: p.market.split("-")[1],
                precision: p.notionalDecimals,
              },
              orderCapabilities: {
                marketOrder: {
                  active: p.orderTypes.includes("market"),
                },
                limitOrder: {
                  active: p.orderTypes.includes("limit"),
                },
              },
            } satisfies Market;
          })
      );
    });
};

export const useBitvavoData = ({
  activeMarket,
  setters,
  isCredentialsProvided,
  credentials,
}: UseHookDataInput): UseHookDataOutput => {
  const {
    setPrices,
    setTickers,
    setInitialTrades,
    addTrade,
    setBookData,
    addBookData,
    setOpenOrders,
    setPastOrders,
    addCancellingOrderIds,
    removeCancellingOrderIds,
    setBalances,
    setError,
    setAuthenticated,
    setConnected,
  } = setters;

  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket<WsResponses>("wss://ws.bitvavo.com/v2?source=exchange", {
      onOpen: () => {
        setConnected(true);
        sendJsonMessage({ action: "getTickerPrice" });

        if (isCredentialsProvided && credentials) {
          const time = new Date().getTime();
          const signature = crypto
            .createHmac("sha256", credentials["api_secret"])
            .update(`${time}GET/v2/websocket`)
            .digest("hex");

          sendJsonMessage({
            action: "authenticate",
            key: credentials["api_key"],
            signature,
            timestamp: time,
          });

          setAuthenticated("loading");
        }
      },
    });

  const subscribeEvent = (event: string, market: Market) => {
    sendJsonMessage({
      action: "subscribe",
      channels: [
        {
          name: event,
          markets: [`${market.base.symbol}-${market.quote.symbol}`],
        },
      ],
    });
  };

  const unsubscribeEvent = (event: string, market: Market) => {
    sendJsonMessage({
      action: "unsubscribe",
      channels: [
        {
          name: event,
          markets: [`${market.base.symbol}-${market.quote.symbol}`],
        },
      ],
    });
  };

  const getOpenOrders = async (): Promise<Order[]> => {
    const orderTypeMapper: {
      [key in BitvavoOrder["orderType"]]: Order["type"];
    } = {
      market: "market",
      limit: "limit",
    };
    try {
      const r = await fetch("/api/gateway/bitvavo", {
        method: "POST",
        body: JSON.stringify({ type: "openOrders" }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json: BitvavoOrder[] = await r.json();
      if ("error" in json && typeof json.error === "string") {
        setError({ error: json.error });
      }

      const statusMap: { [key in BitvavoOrder["status"]]: Order["status"] } = {
        filled: "filled",
        canceled: "canceled",
        new: "open",
      };

      return json.map(
        (r) =>
          ({
            amount: r.amount,
            amountRemaining: r.amountRemaining,
            price: r.price,
            market: r.market,
            baseAssetSymbol: r.market.split("-")[0],
            quoteAssetSymbol: r.market.split("-")[1],
            created: r.created,
            filledAmount: r.filledAmount,
            filledAmountQuote: r.filledAmountQuote,
            id: r.orderId,
            type: orderTypeMapper[r.orderType],
            side: r.side,
            updated: r.updated,
            status: statusMap[r.status],
          } satisfies Order)
      );
    } catch (e) {}

    return [];
  };

  const getPastOrders = async (market: string): Promise<Order[]> => {
    try {
      const r = await fetch("/api/gateway/bitvavo", {
        method: "POST",
        body: JSON.stringify({
          type: "getOrders",
          extra: {
            market,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json: BitvavoOrder[] = await r.json();
      if ("error" in json && typeof json.error === "string") {
        setError({ error: json.error });
      }

      const statusMap: { [key in BitvavoOrder["status"]]: Order["status"] } = {
        filled: "filled",
        canceled: "canceled",
        new: "open",
      };

      return json
        .filter((r) => r.status !== "new")
        .map(
          (r) =>
            ({
              amount: r.amount,
              amountRemaining: r.amountRemaining,
              price: r.price,
              market: r.market,
              baseAssetSymbol: r.market.split("-")[0],
              quoteAssetSymbol: r.market.split("-")[1],
              created: r.created,
              filledAmount: r.filledAmount,
              filledAmountQuote: r.filledAmountQuote,
              id: r.orderId,
              side: r.side,
              updated: r.updated,
              type: r.orderType,
              status: statusMap[r.status],
            } satisfies Order)
        );
    } catch (e) {}

    return [];
  };

  const postCancelOrder = async (
    id: string,
    market: string
  ): Promise<{ orderId: string }> => {
    const r = await fetch("/api/gateway/bitvavo", {
      method: "POST",
      body: JSON.stringify({ type: "postCancelOrder", extra: { id, market } }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await r.json();
  };

  const getBalances = async (): Promise<BalancesHashmap> => {
    const r = await fetch("/api/gateway/bitvavo", {
      method: "POST",
      body: JSON.stringify({ type: "balance" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json: BitvavoBalance[] = await r.json();

    if ("error" in json && typeof json.error === "string") {
      setError({ error: json.error });
    }

    try {
      const balances: BalancesHashmap = {};
      for (const row of json) {
        balances[row.symbol] = {
          asset: row.symbol,
          available: Number(row.available),
          inOrder: Number(row.inOrder),
        };
      }
      return balances;
    } catch (e) {
      return {};
    }
  };

  const onMarketChange = (activeMarket: Market, previousMarket?: Market) => {
    if (activeMarket) {
      sendJsonMessage({
        action: "getTrades",
        market: `${activeMarket.base.symbol}-${activeMarket.quote.symbol}`,
      });
      sendJsonMessage({
        action: "getBook",
        market: `${activeMarket.base.symbol}-${activeMarket.quote.symbol}`,
      });

      subscribeEvent("ticker24h", activeMarket);
      subscribeEvent("trades", activeMarket);
      subscribeEvent("book", activeMarket);

      if (isCredentialsProvided) {
        getOpenOrders().then(setOpenOrders);
        getPastOrders(
          `${activeMarket.base.symbol}-${activeMarket.quote.symbol}`
        ).then(setPastOrders);
        getBalances().then(setBalances);
      }
    }

    if (previousMarket) {
      unsubscribeEvent("ticker24h", previousMarket);
      unsubscribeEvent("trades", previousMarket);
      unsubscribeEvent("book", previousMarket);
    }
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    const msg = lastJsonMessage;
    if ("action" in msg && msg.action === "getTickerPrice") {
      setPrices(arrayToHashmapByMarket(msg.response));
    } else if ("action" in msg && msg.action === "getTrades") {
      setInitialTrades(
        msg.response.map(
          (r) =>
            ({
              id: r.id,
              price: r.price,
              amount: r.amount,
              timestamp: r.timestamp,
              market: activeMarket,
              side: r.side,
            } satisfies Trade)
        )
      );
    } else if ("action" in msg && msg.action === "getBook") {
      setBookData({
        asks: msg.response.asks,
        bids: msg.response.bids,
        market: activeMarket,
      });
    } else if ("event" in msg && msg.event === "ticker24h") {
      const tickers: TickersHashmap = {};
      for (const row of msg.data) {
        const normalizedMarket = `${row.market.split("-")[0]}-${
          row.market.split("-")[1]
        }`;
        tickers[normalizedMarket] = {
          ...row,
          market: normalizedMarket,
        };
      }
      setTickers(tickers);
    } else if ("event" in msg && msg.event === "trade") {
      addTrade({
        id: msg.id,
        price: msg.price,
        amount: msg.amount,
        timestamp: msg.timestamp,
        market: activeMarket,
        side: msg.side,
      });
    } else if ("event" in msg && msg.event === "book") {
      addBookData({
        bids: msg.bids,
        asks: msg.asks,
        market: activeMarket,
      });
    } else if ("event" in msg && msg.event === "authenticate") {
      if (msg.authenticated) {
        subscribeEvent("account", activeMarket);
        setAuthenticated("yes");
      } else {
        setAuthenticated("no");
      }
    } else if ("event" in msg && msg.event === "order") {
      // After an `order` event, request the open orders and balances slightly delayed
      // Because Bitvavo API is lacking behind WS data
      setTimeout(() => {
        // TODO: getOpenOrders and getBalances with debounce
        getOpenOrders().then(setOpenOrders);
        getBalances().then(setBalances);
        getPastOrders(
          `${activeMarket.base.symbol}-${activeMarket.quote.symbol}`
        ).then(setPastOrders);
      }, 1000);
    }
  }, [lastJsonMessage, activeMarket]);

  const cancelOrder = (order: Order) => {
    addCancellingOrderIds([order.id]);
    postCancelOrder(order.id, order.market).then((r) => {
      // if server returns orderId, success cancellation
      if (r.orderId) {
        getOpenOrders().then((r) => {
          setOpenOrders(r);
          removeCancellingOrderIds([order.id]);
        });
      } else {
        removeCancellingOrderIds([order.id]);
      }
    });
  };

  const disconnect = () => {
    getWebSocket()?.close();
  };

  const postPlaceOrder = async (
    market: string,
    side: BitvavoOrder["side"],
    orderType: BitvavoOrder["orderType"],
    body: Record<string, any>
  ): Promise<{ orderId: string }> => {
    const r = await fetch("/api/gateway/bitvavo", {
      method: "POST",
      body: JSON.stringify({
        type: "postPlaceOrder",
        extra: { market, side, orderType, body },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await r.json();
  };

  const createOrder = (payload: CreateOrderPayload) => {
    const orderTypeMapper: {
      [key in Order["type"]]: BitvavoOrder["orderType"];
    } = {
      market: "market",
      limit: "limit",
    };

    postPlaceOrder(
      payload.market,
      payload.side,
      orderTypeMapper[payload.type],
      {
        amount: payload.amount,
        price: payload.price,
      }
    ).then((r) => {
      if (r.orderId) {
        // success action is being listened via `order` WS event
      } else if ("error" in r && typeof r.error === "string") {
        setError({ error: r.error });
      }
    });
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
