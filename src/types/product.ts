export type ProductType = "spot" | "perp";

export const SPOT_PRODUCT = "spot" satisfies ProductType;
export const PERP_PRODUCT = "perp" satisfies ProductType;

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
