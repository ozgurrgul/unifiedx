import type { PerpMarket, PerpMarketsHashmap } from "@/types/lib";
import { HELLO_TRADE_MARKET_DATA_WS } from "./constants";
import type { HelloTradeInstrument, HelloTradeMarketDataMessage } from "./types";

function mapInstrumentToPerpMarket(instrument: HelloTradeInstrument): PerpMarket {
  const quote = instrument.quoteCurrency;
  return {
    market: `${instrument.symbol}-${quote}`,
    brandSymbol: instrument.symbol,
    base: {
      symbol: instrument.symbol,
      precision: instrument.quantityPrecision,
    },
    quote: {
      symbol: quote,
      precision: instrument.pricePrecision,
    },
    orderCapabilities: {
      marketOrder: { active: false },
      limitOrder: { active: false },
    },
  };
}

export function loadHelloTradePerpMarkets(): Promise<PerpMarketsHashmap> {
  return new Promise((resolve, reject) => {
    if (typeof WebSocket === "undefined") {
      reject(new Error("Hello Trade markets require a browser WebSocket"));
      return;
    }

    const ws = new WebSocket(HELLO_TRADE_MARKET_DATA_WS);
    const instruments: HelloTradeInstrument[] = [];
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      ws.close();
      const hashmap: PerpMarketsHashmap = {};
      for (const row of instruments) {
        const market = mapInstrumentToPerpMarket(row);
        hashmap[market.market] = market;
      }
      resolve(hashmap);
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", channel: "instruments" }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as HelloTradeMarketDataMessage;
      if (msg.type === "error") {
        settled = true;
        ws.close();
        reject(new Error(msg.message ?? "Hello Trade instruments error"));
        return;
      }
      if (msg.type === "marketData" && msg.channel === "instruments" && msg.data) {
        if (msg.data.lastMessage === "Y") {
          finish();
          return;
        }
        const row = msg.data as unknown as HelloTradeInstrument;
        if (row.symbol && row.activityStatus === "ACTIVE") {
          instruments.push(row);
        }
      }
    };

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        reject(new Error("Hello Trade instruments WebSocket failed"));
      }
    };

    setTimeout(finish, 12_000);
  });
}
