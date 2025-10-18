"use client";

import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext } from "react";
import { Separator } from "./ui/separator";
import { FormatAmount } from "./common/Formatters";
import { exchangeConfigs } from "@/data/exchangeConfigs";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { $bus, BusEvent } from "./ExchangeBus";

export const SubHeader = () => {
  const {
    getters: {
      activeExchange: { exchange },
      activeMarket: { ticker, base, quote },
    },
  } = useContext(ExchangeDataGettersContext);

  const exchangeConfig = exchangeConfigs[exchange];

  const onRefreshDataClick = () => {
    $bus.emit(BusEvent.RefreshDataLayer);
  };

  return (
    <div
      className="flex items-center px-4 widget-subheader"
      style={{ gridArea: "subheader" }}
    >
      <div className="font-bold pr-6 text-sm">
        {base?.symbol}-{quote?.symbol}
      </div>
      <Separator orientation="vertical" />
      <div className="pl-6 pr-6 text-sm">
        <div className="text-muted-foreground text-xs">
          Last Price ({quote?.symbol})
        </div>
        <FormatAmount amount={ticker?.last} precision={quote?.precision} />
      </div>
      {ticker?.volumeQuote && (
        <div className="pr-6 text-sm">
          <div className="text-muted-foreground text-xs">
            24h Volume ({quote?.symbol})
          </div>
          <FormatAmount
            amount={ticker?.volumeQuote}
            precision={quote?.precision}
          />
        </div>
      )}
      {ticker?.high && (
        <div className="pr-6 text-sm">
          <div className="text-muted-foreground text-xs">
            24h High ({quote?.symbol})
          </div>
          <FormatAmount amount={ticker?.high} precision={quote?.precision} />
        </div>
      )}
      {ticker?.low && (
        <div className="pr-6 text-sm">
          <div className="text-muted-foreground text-xs">
            24h Low ({quote?.symbol})
          </div>
          <FormatAmount amount={ticker?.low} precision={quote?.precision} />
        </div>
      )}
      <Separator orientation="vertical" />
      {!exchangeConfig.wsStreaming && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="ml-4">
              <ReloadIcon onClick={() => onRefreshDataClick()} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh data manually</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
