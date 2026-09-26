import { useRouter } from "next/router";
import { useEffect } from "react";
import { spotMarketPath } from "@/types/product";

/** Legacy spot URL → canonical /{exchange}/spot/market/{spotMarketId} */
export default function LegacySpotMarketRedirectPage() {
  const router = useRouter();
  const exchange = router.query.exchange ? String(router.query.exchange) : undefined;
  const spotMarketId = router.query.market ? String(router.query.market) : undefined;

  useEffect(() => {
    if (!exchange || !spotMarketId || !router.isReady) {
      return;
    }
    router.replace(spotMarketPath(exchange, spotMarketId));
  }, [exchange, router, router.isReady, spotMarketId]);

  return null;
}
