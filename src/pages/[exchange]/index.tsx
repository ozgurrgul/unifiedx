import { useRouter } from "next/router";
import { ExchangeRedirectToDefaultSpotMarket } from "@/components/ExchangeRedirectToDefaultSpotMarket";
import { type ExchangeType, spotExchangeConfigs } from "@/data/exchangeConfigs";

export default function ExchangePage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;

  if (!exchange) {
    return null;
  }

  const exchangeConfig = spotExchangeConfigs[exchange];

  if (!exchangeConfig) {
    return <div>Exchange is not configured {exchange}</div>;
  }

  return <ExchangeRedirectToDefaultSpotMarket exchange={exchange} />;
}
