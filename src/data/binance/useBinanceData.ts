import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import {
  Binance24hTickerPrice,
  BinanceBookApiResponse,
  BinanceDepthWs,
  BinanceMarket,
  BinanceTradeApi,
  BinanceTradeWs,
  WsResponses,
} from "./types";
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
import { UseExchangeDataInput, UseExchangeDataOutput } from "../types";

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

export const loadMarkets = (): Promise<MarketsHashmap> => {
  return fetch(`${BINANCE_API_BASE_URL}/exchangeInfo`)
    .then((r) => r.json())
    .then((r) => {
      const config: {
        symbols: BinanceMarket[];
      } = r;

      const mappedMarkets: MarketsHashmap = arrayToHashmapByMarket(
        config.symbols
          .filter((p) => p.status === "TRADING")
          .map((p) => {
            const market: Market = {
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

const getTrades = (activeMarket: Market) => {
  return fetch(
    `${BINANCE_API_BASE_URL}/trades?symbol=${activeMarket.base.symbol}${activeMarket.quote.symbol}`
  )
    .then((r) => r.json())
    .then((r) => {
      const config: BinanceTradeApi[] = r;
      const mappedTrades: Trade[] = config.map((p) => {
        const trade: Trade = {
          market: activeMarket,
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

const getTickers = (markets: MarketsHashmap) => {
  return fetch(`${BINANCE_API_BASE_URL}/ticker/24hr`)
    .then((r) => r.json())
    .then((r) => {
      const config: Binance24hTickerPrice[] = r;
      const marketsArr = Object.values(markets);

      const mappedTickers: TickersHashmap = arrayToHashmapByMarket(
        config.map((p) => {
          const market = marketsArr.find(
            (m) => m.brandSymbol === p.symbol
          )?.market;

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

const getBook = (activeMarket: Market) => {
  return fetch(
    `${BINANCE_API_BASE_URL}/depth?symbol=${activeMarket.base.symbol}${activeMarket.quote.symbol}`
  )
    .then((r) => r.json())
    .then((r) => {
      const config: BinanceBookApiResponse = r;
      const mappedBook: BookData = {
        asks: config.asks,
        bids: config.bids,
        market: activeMarket,
      };
      return mappedBook;
    });
};

export const useBinanceData = ({
  activeMarket,
  setters,
  isCredentialsProvided,
  credentials,
}: UseExchangeDataInput): UseExchangeDataOutput => {
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

  const tradeStream = `${activeMarket.base.symbol.toLowerCase()}${activeMarket.quote.symbol.toLowerCase()}@trade`;
  const depthStream = `${activeMarket.base.symbol.toLowerCase()}${activeMarket.quote.symbol.toLowerCase()}@depth@5`;

  const { lastJsonMessage, sendJsonMessage, readyState, getWebSocket } =
    useWebSocket<WsResponses>("wss://stream.binance.com:443/stream", {
      onOpen: () => {
        setConnected(true);
        sendJsonMessage({
          method: "SUBSCRIBE",
          params: [tradeStream, depthStream],
          id: 1,
        });
      },
      onError: () => {
        setConnected(false);
        setError({ error: "Failed to connect to websocket" });
      },
      onClose: () => {
        setConnected(false);
        setError({ error: "Websocket closed" });
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
    const msg = lastJsonMessage;
    // Handle trade
    if (msg.stream === tradeStream) {
      const data = msg.data as BinanceTradeWs["data"];
      const mapped: Trade = {
        amount: data.q,
        price: data.p,
        timestamp: data.E,
        market: activeMarket,
        id: data.t,
        side: data.m ? "sell" : "buy",
      };
      addTrade(mapped);
    } else if (msg.stream === depthStream) {
      const data = msg.data as BinanceDepthWs["data"];
      const mapped: BookData = {
        asks: data.a,
        bids: data.b,
        market: activeMarket,
      };
      addBookData(mapped);
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
