import { useRouter } from "next/router";
import { type ExchangeType, spotExchangeConfigs } from "@/data/exchangeConfigs";
import { spotMarketIdFromSymbols, spotMarketPath } from "@/types/product";

export const useAppNavigation = () => {
  const router = useRouter();

  const goToExchange = (exchange: ExchangeType) => {
    const { defaultSpotMarket } = spotExchangeConfigs[exchange];
    router.push(
      spotMarketPath(
        exchange,
        spotMarketIdFromSymbols(
          defaultSpotMarket.base.symbol,
          defaultSpotMarket.quote.symbol
        )
      )
    );
  };

  const goToSpotMarket = (
    exchange: ExchangeType,
    baseAssetSymbol: string,
    quoteAssetSymbol: string
  ) => {
    router.push(
      spotMarketPath(
        exchange,
        spotMarketIdFromSymbols(baseAssetSymbol, quoteAssetSymbol)
      )
    );
  };

  /** @deprecated Use goToSpotMarket */
  const goToMarket = goToSpotMarket;

  return {
    goToExchange,
    goToSpotMarket,
    goToMarket,
  };
};
