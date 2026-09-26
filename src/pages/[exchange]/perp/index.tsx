import { useRouter } from "next/router";
import { ExchangeRedirectToDefaultPerpMarket } from "@/components/ExchangeRedirectToDefaultPerpMarket";
import { isPerpSupportedExchange } from "@/data/perp/exchangeConfigs";

export default function ExchangePerpIndexPage() {
  const router = useRouter();
  const exchange = router.query.exchange ? String(router.query.exchange) : undefined;

  if (!exchange) {
    return null;
  }

  if (!isPerpSupportedExchange(exchange)) {
    return <div className="p-4 text-sm">Perpetuals are not supported for {exchange}</div>;
  }

  return <ExchangeRedirectToDefaultPerpMarket exchange={exchange} />;
}
