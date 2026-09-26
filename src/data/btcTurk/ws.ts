import type { SpotMarket, Trade } from "@/types/lib";
import type { BtcTurkWsTradeSingle } from "./types";

export function btcTurkPairEvent(market: SpotMarket): string {
  return `${market.base.symbol}${market.quote.symbol}`.toUpperCase();
}

export function btcTurkSubscriptionMessage(
  channel: "trade" | "orderbook",
  event: string,
  join: boolean
): string {
  return JSON.stringify([
    151,
    {
      type: 151,
      channel,
      event,
      join,
    },
  ]);
}

export function mapBtcTurkWsTrade(
  row: BtcTurkWsTradeSingle,
  market: SpotMarket
): Trade {
  return {
    id: row.I,
    price: row.P,
    amount: row.A,
    timestamp: row.D,
    side: row.S === 0 ? "buy" : "sell",
    market,
  };
}
