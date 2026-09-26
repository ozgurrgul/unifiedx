/** Canonical spot market URL: /{exchange}/spot/market/{spotMarketId} */
export function spotMarketPath(exchange: string, spotMarketId: string) {
  return `/${exchange}/spot/market/${spotMarketId}`;
}

export function spotMarketIdFromSymbols(
  baseAssetSymbol: string,
  quoteAssetSymbol: string
) {
  return `${baseAssetSymbol}-${quoteAssetSymbol}`;
}
