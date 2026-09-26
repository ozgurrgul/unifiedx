import { useRouter } from "next/router";
import { ExchangeGrid } from "@/components/ExchangeGrid";
import { PerpExchangeDataLayerInitialization } from "@/components/PerpExchangeDataLayerInitialization";
import { Toaster } from "@/components/ui/toaster";
import { TradingProductProvider } from "@/context/TradingProductContext";
import type { ExchangeType } from "@/data/exchangeConfigs";
import { isPerpSupportedExchange } from "@/data/perp/exchangeConfigs";
import { ExchangeDataGettersContextTypeProvider } from "@/data/ExchangeDataGettersContext";
import { ExchangeDataSettersContextProvider } from "@/data/ExchangeDataSettersContext";

export default function PerpMarketPage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;
  const perpMarketId = router.query.perpMarket
    ? String(router.query.perpMarket)
    : undefined;

  if (!exchange || !perpMarketId) {
    return null;
  }

  if (!isPerpSupportedExchange(exchange)) {
    return <div className="p-4 text-sm">Perpetuals are not supported for {exchange}</div>;
  }

  const dataScopeKey = `${exchange}-perp-${perpMarketId}`;

  return (
    <TradingProductProvider product="perp">
      <ExchangeDataSettersContextProvider
        key={dataScopeKey}
        activeSpotMarketId={perpMarketId}
      >
        <ExchangeDataGettersContextTypeProvider
          key={dataScopeKey}
          activeExchange={exchange}
          activeSpotMarketId={perpMarketId}
        >
          <ExchangeGrid />
          <PerpExchangeDataLayerInitialization
            key={exchange}
            activeExchange={exchange}
            activeSpotMarketId={perpMarketId}
          />
        </ExchangeDataGettersContextTypeProvider>
        <Toaster />
      </ExchangeDataSettersContextProvider>
    </TradingProductProvider>
  );
}
