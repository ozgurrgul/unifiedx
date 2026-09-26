import { useRouter } from "next/router";
import { ExchangeRedirectToDefaultSpotMarket } from "@/components/ExchangeRedirectToDefaultSpotMarket";
import {
  type ExchangeType,
  isPerpOnlyExchange,
  spotExchangeConfigs,
} from "@/data/exchangeConfigs";
import { ExchangeRedirectToDefaultPerpMarket } from "@/components/ExchangeRedirectToDefaultPerpMarket";

export default function ExchangePage() {
  const router = useRouter();
  const exchange = router.query.exchange
    ? (String(router.query.exchange) as ExchangeType)
    : undefined;

  if (!exchange) {
    return null;
  }

  if (isPerpOnlyExchange(exchange)) {
    return <ExchangeRedirectToDefaultPerpMarket exchange={exchange} />;
  }

  const exchangeConfig = spotExchangeConfigs[exchange];

  if (!exchangeConfig) {
    return <div>Exchange is not configured {exchange}</div>;
  }

  return <ExchangeRedirectToDefaultSpotMarket exchange={exchange} />;
}
