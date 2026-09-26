import type {
  ExchangeCredentialInput,
  UseSpotExchangeDataInput,
  UseSpotExchangeDataOutput,
} from "../spot/types";
import type { PerpMarketsHashmap } from "@/types/lib";

export type PerpSupportedExchange = "binance" | "helloTrade";

export type PerpExchangeConfig = {
  product: "perp";
  defaultPerpMarket: {
    base: { symbol: string };
    quote: { symbol: string };
  };
  data: (input: UseSpotExchangeDataInput) => UseSpotExchangeDataOutput;
  loadPerpMarkets: () => Promise<PerpMarketsHashmap>;
  wsStreaming: boolean;
  neededCredentials: ExchangeCredentialInput[];
};
