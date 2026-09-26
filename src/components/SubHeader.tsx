"use client";

import { useContext } from "react";
import { ExchangeLogo } from "@/components/ExchangeLogo";
import { useTradingProduct } from "@/context/TradingProductContext";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { FormatAmount } from "./common/Formatters";
import { Separator } from "./ui/separator";

function formatFundingRate(rate?: string) {
  if (!rate) {
    return null;
  }
  const n = parseFloat(rate);
  if (Number.isNaN(n)) {
    return null;
  }
  return `${(n * 100).toFixed(4)}%`;
}

function formatFundingTime(ms?: number) {
  if (!ms) {
    return null;
  }
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SubHeader = () => {
  const product = useTradingProduct();
  const {
    getters: {
      activeExchange: { exchange },
      activeSpotMarket: { ticker, base, quote },
    },
  } = useContext(ExchangeDataGettersContext);
  const fundingRateLabel = formatFundingRate(ticker?.fundingRate);
  const nextFundingLabel = formatFundingTime(ticker?.nextFundingTimeMs);

  return (
    <div className="flex items-center px-4 widget-subheader gap-0 shrink-0 min-h-[68px] border-b border-border">
      {exchange && (
        <div className="flex items-center gap-2 pr-4 mr-2 border-r border-border">
          <ExchangeLogo exchange={exchange} size={28} />
        </div>
      )}

      <div className="pr-6">
        <div className="text-lg font-bold tracking-tight">
          {base?.symbol}
          <span className="text-muted-foreground font-normal">/{quote?.symbol}</span>
        </div>
      </div>

      <Separator orientation="vertical" className="h-10" />

      <div className="pl-5 pr-6">
        <div className="ticker-label">Last Price</div>
        <div className="ticker-value">
          <FormatAmount amount={ticker?.last} precision={quote?.precision} />
          <span className="text-xs text-muted-foreground ml-1 font-normal">
            {quote?.symbol}
          </span>
        </div>
      </div>

      {product === "perp" && ticker?.markPrice && (
        <div className="pr-6">
          <div className="ticker-label">Mark</div>
          <div className="ticker-value">
            <FormatAmount amount={ticker.markPrice} precision={quote?.precision} />
          </div>
        </div>
      )}

      {product === "perp" && ticker?.indexPrice && (
        <div className="pr-6">
          <div className="ticker-label">Index</div>
          <div className="ticker-value">
            <FormatAmount amount={ticker.indexPrice} precision={quote?.precision} />
          </div>
        </div>
      )}

      {product === "perp" && fundingRateLabel && (
        <div className="pr-6">
          <div className="ticker-label">Funding</div>
          <div className="ticker-value">
            {fundingRateLabel}
            {nextFundingLabel && (
              <span className="text-xs text-muted-foreground ml-1 font-normal">
                @ {nextFundingLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {ticker?.volumeQuote && (
        <div className="pr-6">
          <div className="ticker-label">24h Volume</div>
          <div className="ticker-value">
            <FormatAmount amount={ticker?.volumeQuote} precision={quote?.precision} />
          </div>
        </div>
      )}

      {ticker?.high && (
        <div className="pr-6">
          <div className="ticker-label">24h High</div>
          <div className="ticker-value text-bid">
            <FormatAmount amount={ticker?.high} precision={quote?.precision} />
          </div>
        </div>
      )}

      {ticker?.low && (
        <div className="pr-6">
          <div className="ticker-label">24h Low</div>
          <div className="ticker-value text-ask">
            <FormatAmount amount={ticker?.low} precision={quote?.precision} />
          </div>
        </div>
      )}
    </div>
  );
};
