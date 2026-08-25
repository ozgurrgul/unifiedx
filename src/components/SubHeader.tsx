"use client";

import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext } from "react";
import { Separator } from "./ui/separator";
import { FormatAmount } from "./common/Formatters";

export const SubHeader = () => {
  const {
    getters: {
      activeMarket: { ticker, base, quote },
    },
  } = useContext(ExchangeDataGettersContext);

  return (
    <div
      className="flex items-center px-4 widget-subheader gap-0"
      style={{ gridArea: "subheader" }}
    >
      <div className="pr-6">
        <div className="text-lg font-bold tracking-tight">
          {base?.symbol}
          <span className="text-muted-foreground font-normal">
            /{quote?.symbol}
          </span>
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

      {ticker?.volumeQuote && (
        <div className="pr-6">
          <div className="ticker-label">24h Volume</div>
          <div className="ticker-value">
            <FormatAmount
              amount={ticker?.volumeQuote}
              precision={quote?.precision}
            />
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
