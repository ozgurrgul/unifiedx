/** Canonical spot market URL: /{exchange}/spot/market/{spotMarketId} */
export function spotMarketPath(exchange: string, spotMarketId: string) {
  return `/${exchange}/spot/market/${spotMarketId}`;
}

/** Canonical perp market URL: /{exchange}/perp/market/{perpMarketId} */
export function perpMarketPath(exchange: string, perpMarketId: string) {
  return `/${exchange}/perp/market/${perpMarketId}`;
}

export function spotMarketIdFromSymbols(
  baseAssetSymbol: string,
  quoteAssetSymbol: string
) {
  return `${baseAssetSymbol}-${quoteAssetSymbol}`;
}

export const perpMarketIdFromSymbols = spotMarketIdFromSymbols;
