import { useRouter } from "next/router";
import { type ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";

export const useAppNavigation = () => {
  const router = useRouter();

  const goToExchange = (exchange: ExchangeType) => {
    const { defaultMarket } = exchangeConfigs[exchange];
    router.push(
      `/${exchange}/market/${defaultMarket.base.symbol}-${defaultMarket.quote.symbol}`
    );
  };

  const goToMarket = (
    exchange: ExchangeType,
    baseAssetSymbol: string,
    quoteAssetSymbol: string
  ) => {
    router.push(`/${exchange}/market/${baseAssetSymbol}-${quoteAssetSymbol}`);
  };

  return {
    goToExchange,
    goToMarket,
  };
};
