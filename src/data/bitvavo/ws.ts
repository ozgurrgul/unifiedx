import type { SpotMarket } from "@/types/lib";

export function bitvavoMarketId(market: SpotMarket): string {
  return `${market.base.symbol}-${market.quote.symbol}`;
}

type BitvavoWsSend = (payload: object) => void;

const STREAM_CHANNELS = ["trades", "book", "ticker24h"] as const;

function channelEntries(marketId: string) {
  return STREAM_CHANNELS.map((name) => ({
    name,
    markets: [marketId],
  }));
}

/** https://docs.bitvavo.com/docs/websocket-api/trades-subscription/ */
export function subscribeBitvavoTrades(send: BitvavoWsSend, market: SpotMarket): void {
  send({
    action: "subscribe",
    channels: [{ name: "trades", markets: [bitvavoMarketId(market)] }],
  });
}

export function unsubscribeBitvavoTrades(send: BitvavoWsSend, market: SpotMarket): void {
  send({
    action: "unsubscribe",
    channels: [{ name: "trades", markets: [bitvavoMarketId(market)] }],
  });
}

export function syncBitvavoMarketStreams(
  send: BitvavoWsSend,
  nextMarket: SpotMarket,
  previousMarket?: SpotMarket
): void {
  if (previousMarket) {
    const prevId = bitvavoMarketId(previousMarket);
    send({
      action: "unsubscribe",
      channels: channelEntries(prevId),
    });
  }

  const nextId = bitvavoMarketId(nextMarket);
  send({ action: "getTrades", market: nextId });
  send({ action: "getBook", market: nextId });
  send({
    action: "subscribe",
    channels: channelEntries(nextId),
  });
}
