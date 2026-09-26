import type {
  ExchangeCredentialInput,
  UseSpotExchangeDataInput,
  UseSpotExchangeDataOutput,
} from "../spot/types";
import type { SpotMarketsHashmap } from "@/types/lib";

export type PerpSupportedExchange = "binance";

export type PerpExchangeConfig = {
  product: "perp";
  defaultPerpMarket: {
    base: { symbol: string };
    quote: { symbol: string };
  };
  data: (input: UseSpotExchangeDataInput) => UseSpotExchangeDataOutput;
  loadPerpMarkets: () => Promise<SpotMarketsHashmap>;
  wsStreaming: boolean;
  neededCredentials: ExchangeCredentialInput[];
};
