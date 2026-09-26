import { useRouter } from "next/router";
import { ExchangeDataLayerInitialization } from "@/components/ExchangeDataLayerInitialization";
import { ExchangeGrid } from "@/components/ExchangeGrid";
import { Toaster } from "@/components/ui/toaster";
import { TradingProductProvider } from "@/context/TradingProductContext";
import { ExchangeDataGettersContextTypeProvider } from "@/data/ExchangeDataGettersContext";
import { ExchangeDataSettersContextProvider } from "@/data/ExchangeDataSettersContext";
import type { ExchangeType } from "@/data/exchangeConfigs";

export default function SpotMarketPage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;
  const spotMarketId = router.query.spotMarket
    ? String(router.query.spotMarket)
    : undefined;

  if (!exchange || !spotMarketId) {
    return null;
  }

  const dataScopeKey = `${exchange}-spot-${spotMarketId}`;

  return (
    <TradingProductProvider product="spot">
      <ExchangeDataSettersContextProvider
        key={dataScopeKey}
        activeSpotMarketId={spotMarketId}
      >
        <ExchangeDataGettersContextTypeProvider
          key={dataScopeKey}
          activeExchange={exchange}
          activeSpotMarketId={spotMarketId}
        >
          <ExchangeGrid />
          <ExchangeDataLayerInitialization
            key={exchange}
            activeExchange={exchange}
            activeSpotMarketId={spotMarketId}
          />
        </ExchangeDataGettersContextTypeProvider>
        <Toaster />
      </ExchangeDataSettersContextProvider>
    </TradingProductProvider>
  );
}
