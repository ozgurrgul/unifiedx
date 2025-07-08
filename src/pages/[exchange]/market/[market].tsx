import { ExchangeGrid } from "@/components/ExchangeGrid";
import { ExchangeDataSettersContextProvider } from "@/data/ExchangeDataSettersContext";
import { ExchangeDataGettersContextTypeProvider } from "@/data/ExchangeDataGettersContext";
import { useRouter } from "next/router";
import { useState } from "react";
import { ExchangeDataLayerInitialization } from "@/components/ExchangeDataLayerInitialization";
import { ExchangeType } from "@/data/exchangeConfigs";
import { Toaster } from "@/components/ui/toaster";

export default function MarketPage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;
  const market = router.query.market ? String(router.query.market) : undefined;

  const [layoutConfigured, setLayoutConfigured] = useState(false);

  if (!exchange || !market) {
    return null;
  }

  const onLayoutConfigure = () => {
    setLayoutConfigured(true);
  };

  return (
    <ExchangeDataSettersContextProvider
      onLayoutConfigure={onLayoutConfigure}
      activeMarket={market}
    >
      {market && (
        <ExchangeDataGettersContextTypeProvider
          activeExchange={exchange as ExchangeType}
          activeMarket={market}
        >
          <ExchangeGrid />
          {layoutConfigured && exchange && (
            <ExchangeDataLayerInitialization
              activeExchange={exchange}
              activeMarket={market}
            />
          )}
        </ExchangeDataGettersContextTypeProvider>
      )}
      <Toaster />
    </ExchangeDataSettersContextProvider>
  );
}
