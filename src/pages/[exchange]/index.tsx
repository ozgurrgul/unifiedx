import { useRouter } from "next/router";
import { ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { ExchangeRedirectToDefaultMarket } from "@/components/ExchangeRedirectToDefaultMarket";

export default function ExchangePage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;

  if (!exchange) {
    return null;
  }

  const exchangeConfig = exchangeConfigs[exchange];

  if (!exchangeConfig) {
    return <div>Exchange is not configured {exchange}</div>;
  }

  return <ExchangeRedirectToDefaultMarket exchange={exchange} />;
}
