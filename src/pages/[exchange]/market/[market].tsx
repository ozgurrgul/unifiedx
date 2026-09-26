import { useRouter } from "next/router";
import { ExchangeDataLayerInitialization } from "@/components/ExchangeDataLayerInitialization";
import { ExchangeGrid } from "@/components/ExchangeGrid";
import { Toaster } from "@/components/ui/toaster";
import { ExchangeDataGettersContextTypeProvider } from "@/data/ExchangeDataGettersContext";
import { ExchangeDataSettersContextProvider } from "@/data/ExchangeDataSettersContext";
import type { ExchangeType } from "@/data/exchangeConfigs";

export default function MarketPage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;
  const market = router.query.market ? String(router.query.market) : undefined;

  if (!exchange || !market) {
    return null;
  }

  const dataScopeKey = `${exchange}-${market}`;

  return (
    <ExchangeDataSettersContextProvider key={dataScopeKey} activeMarket={market}>
      {market && (
        <ExchangeDataGettersContextTypeProvider
          key={dataScopeKey}
          activeExchange={exchange as ExchangeType}
          activeMarket={market}
        >
          <ExchangeGrid />
          <ExchangeDataLayerInitialization
            key={exchange}
            activeExchange={exchange}
            activeMarket={market}
          />
        </ExchangeDataGettersContextTypeProvider>
      )}
      <Toaster />
    </ExchangeDataSettersContextProvider>
  );
}
