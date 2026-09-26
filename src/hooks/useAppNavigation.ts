import { useRouter } from "next/router";
import type { ExchangeType } from "@/data/exchangeConfigs";

export const useAppNavigation = () => {
  const router = useRouter();

  const goToExchange = (exchange: ExchangeType) => {
    // TODO: using router.push causing a nasty error on ExchangeDataLayer
    // So use native redirect until I fix it
    // router.push(`/${exchange}`);
    document.location.href = `/${exchange}`;
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
