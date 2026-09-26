import type { PerpExchangeConfig, PerpSupportedExchange } from "./types";

/** Perp adapters keyed by exchange — populate when implementing derivatives. */
export const perpExchangeConfigs: Partial<
  Record<PerpSupportedExchange, PerpExchangeConfig>
> = {};
