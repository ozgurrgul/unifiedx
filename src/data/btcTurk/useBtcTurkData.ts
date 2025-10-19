import { useEffect } from "react";
import crypto from "crypto";
import useWebSocket from "react-use-websocket";
import {
  Market,
  MarketsHashmap,
  Trade,
  Ticker,
  TickersHashmap,
  BookData,
  Order,
  CreateOrderPayload,
} from "@/types/lib";
import { UseHookDataInput, UseHookDataOutput } from "../types";
import {
  BtcTurkBook,
  BtcTurkCurrency,
  BtcTurkSymbol,
  BtcTurkTicker,
  BtcTurkTrade,
  WsResponses,
} from "./types";
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

const getAuthSignature = async (publicKey: string, privateKey: string) => {
  const serverTimeResponse = await fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({ type: "/server/time" }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());
  const serverTime = serverTimeResponse.serverTime;
  const nonce = 3011;
  const stamp = serverTime;
  const baseString = `${publicKey}${nonce}`;
  const data = Buffer.from(`${baseString}`, "utf8");
  const buffer = crypto.createHmac("sha256", Buffer.from(privateKey, "base64"));
  buffer.update(data);
  const signature = Buffer.from(
    buffer.digest().toString("base64"),
    "utf8"
  ).toString("utf8");
  const message = `[114,{"type":114, "publicKey":"${publicKey}", "timestamp":${stamp}, "nonce":${nonce}, "signature": "${signature}"}]`;
  return message;
};

export const loadMarkets = (): Promise<MarketsHashmap> => {
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

      const mappedMarkets: MarketsHashmap = arrayToHashmapByMarket(
        config.data.symbols
          .filter((p) => p.status === "TRADING")
          .map((p) => {
            const baseCurrency = config.data.currencies.find(
              (r) => r.symbol === p.numerator
            );
            const quoteCurrency = config.data.currencies.find(
              (r) => r.symbol === p.denominator
            );
            const market: Market = {
              market: `${p.numerator}-${p.denominator}`,
              brandSymbol: p.nameNormalized,
              base: {
                symbol: p.numerator,
                precision:
                  baseCurrency?.precision || DEFAULT_BASE_ASSET_PRECISION,
              },
              quote: {
                symbol: p.denominator,
                precision:
                  quoteCurrency?.precision || DEFAULT_QUOTE_ASSET_PRECISION,
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

const getTrades = (activeMarket: Market) => {
  return fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({
      type: "/trades",
      extra: {
        market: `${activeMarket.base.symbol}${activeMarket.quote.symbol}`,
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
          market: activeMarket,
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

const getTickers = (markets: MarketsHashmap) => {
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

const getBook = (activeMarket: Market) => {
  return fetch(`/api/gateway/btcTurk`, {
    method: "POST",
    body: JSON.stringify({
      type: "/orderbook",
      extra: {
        market: `${activeMarket.base.symbol}${activeMarket.quote.symbol}`,
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
        market: activeMarket,
      };
      return mappedBook;
    });
};

export const useBtcTurkData = ({
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
    setAuthenticated,
    setError,
    markets,
    setConnected,
  } = setters;

  const {
    lastJsonMessage,
    sendJsonMessage,
    sendMessage,
    readyState,
    getWebSocket,
  } = useWebSocket<any>("wss://ws-feed-pro.btcturk.com", {
    onOpen: async () => {
      setConnected(true);
      // if (isCredentialsProvided && credentials) {
      //   sendMessage(
      //     await getAuthSignature(
      //       credentials["public_key"],
      //       credentials["private_key"]
      //     )
      //   );
      //   setAuthenticated("loading");
      // }
    },
  });

  const onMarketChange = (activeMarket: Market, previousMarket?: Market) => {
    if (activeMarket) {
      getTickers(markets).then(setTickers);
      getBook(activeMarket).then(setBookData);
      getTrades(activeMarket).then(setInitialTrades);
    }

    if (previousMarket) {
    }
  };

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }
    const msg = lastJsonMessage as WsResponses;
    if (Array.isArray(msg) && msg[1].type === 114) {
      setAuthenticated("no");
      setError({ error: msg[1].message });
    }
  }, [lastJsonMessage]);

  const cancelOrder = (order: Order) => {};

  const createOrder = (payload: CreateOrderPayload) => {};

  const disconnect = () => {
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
