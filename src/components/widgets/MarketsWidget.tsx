"use client";

import Fuse from "fuse.js";
import { MoreHorizontal } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTradingProduct } from "@/context/TradingProductContext";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import type { PerpSupportedExchange } from "@/data/perp/types";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { cn } from "@/lib/utils";
import type { SpotMarket, SpotMarketsHashmap } from "@/types/lib";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { ExchangeWidget } from "./ExchangeWidget";

const getUniqueMarketQuotes = (markets: SpotMarketsHashmap) => {
  const quotes: string[] = [];
  const marketArray = Object.values(markets);
  marketArray.forEach((market) => {
    if (!quotes.includes(market.quote.symbol)) {
      quotes.push(market.quote.symbol);
    }
  });
  return quotes;
};

const RemaningMarkets: React.FC<{
  viewingMarketQuote?: string;
  visibleMarketQuoteSymbols: string[];
  marketQuoteSymbols: string[];
  onSelect: (quote: string) => void;
}> = ({
  viewingMarketQuote,
  visibleMarketQuoteSymbols,
  marketQuoteSymbols,
  onSelect,
}) => {
  const remainingMarketQuoteSymbols = marketQuoteSymbols.filter(
    (m) => !visibleMarketQuoteSymbols.includes(m)
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <MoreHorizontal className="cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent
        className="w-48 grid gap-2"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        {remainingMarketQuoteSymbols.map((quote) => {
          const isActive = quote === viewingMarketQuote;
          return (
            <button
              key={quote}
              type="button"
              className={cn(
                "text-xs hover:text-foreground cursor-pointer flex justify-center items-center rounded-md px-2 py-1 transition-colors",
                {
                  "font-semibold text-foreground bg-secondary": isActive,
                }
              )}
              onClick={() => onSelect(quote)}
            >
              {quote}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export const MarketsWidget: React.FC = () => {
  const {
    getters: {
      activeExchange: { exchange, marketsLoading },
      activeSpotMarket: { spotMarketId, spotMarkets, prices },
    },
  } = useContext(ExchangeDataGettersContext);
  const product = useTradingProduct();
  const { goToSpotMarket, goToPerpMarket } = useAppNavigation();

  const [searchInputText, setSearchInputText] = useState("");
  const marketQuoteSymbols = useMemo(
    () => getUniqueMarketQuotes(spotMarkets),
    [spotMarkets]
  );
  const visibleMarketQuoteSymbols = useMemo(
    () =>
      marketQuoteSymbols.length > 5
        ? marketQuoteSymbols.slice(0, 5)
        : marketQuoteSymbols,
    [marketQuoteSymbols]
  );

  const [viewingMarketQuote, setViewingMarketQuote] = useState<string>();
  const lastSyncedSpotMarketIdRef = useRef<string | null>(null);

  useEffect(() => {
    const activeQuote = spotMarkets[spotMarketId]?.quote.symbol;
    const marketChanged = lastSyncedSpotMarketIdRef.current !== spotMarketId;

    if (marketChanged && activeQuote) {
      lastSyncedSpotMarketIdRef.current = spotMarketId;
      setViewingMarketQuote(activeQuote);
      return;
    }

    if (viewingMarketQuote === undefined && activeQuote) {
      setViewingMarketQuote(activeQuote);
      lastSyncedSpotMarketIdRef.current = spotMarketId;
      return;
    }

    if (viewingMarketQuote === undefined && marketQuoteSymbols[0]) {
      setViewingMarketQuote(marketQuoteSymbols[0]);
    }
  }, [spotMarketId, spotMarkets, marketQuoteSymbols, viewingMarketQuote]);

  const getMarketsByQuote = (_markets: SpotMarket[]) => {
    if (!viewingMarketQuote) {
      return _markets;
    }

    return _markets.filter((r) => r.quote.symbol === viewingMarketQuote);
  };

  const getMarkets = () => {
    const marketsArray = Object.values(spotMarkets);
    if (searchInputText) {
      const fuse = new Fuse(marketsArray, {
        distance: 100,
        threshold: 0.4,
        keys: ["market", "base.symbol", "quote.symbol"],
      });
      return fuse.search(searchInputText).map((r) => r.item);
    }

    return getMarketsByQuote(marketsArray);
  };

  const header = (
    <>
      <div className="p-2">
        <Input
          placeholder="Search markets..."
          onChange={(e) => setSearchInputText(e.target.value)}
          className="bg-secondary/50 border-border h-8 text-xs"
          value={searchInputText}
        />
      </div>
      <div className="flex items-center gap-1 px-2 pb-2 flex-wrap">
        {visibleMarketQuoteSymbols?.map((quoteSymbol) => (
          <button
            key={quoteSymbol}
            type="button"
            onClick={() => setViewingMarketQuote(quoteSymbol)}
            className={cn("exchange-pill", {
              "exchange-pill-active": quoteSymbol === viewingMarketQuote,
            })}
          >
            {quoteSymbol}
          </button>
        ))}
        {visibleMarketQuoteSymbols?.length < marketQuoteSymbols?.length && (
          <RemaningMarkets
            viewingMarketQuote={viewingMarketQuote}
            visibleMarketQuoteSymbols={visibleMarketQuoteSymbols}
            marketQuoteSymbols={marketQuoteSymbols}
            onSelect={(quote) => setViewingMarketQuote(quote)}
          />
        )}
      </div>
      <Table className="pt-2">
        <TableHeader className="w-full">
          <TableRow>
            <TableHead className="h-7 px-4 text-[10px] uppercase tracking-wider w-[150px]">
              Market
            </TableHead>
            <TableHead className="h-7 px-4 text-[10px] uppercase tracking-wider text-right">
              Price
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>
  );

  const realMarkets = (
    <>
      {getMarkets().map((market) => {
        const isActive = market.market === spotMarketId;
        return (
          <TableRow
            key={market.market}
            onClick={() => {
              if (product === "perp") {
                goToPerpMarket(
                  exchange as PerpSupportedExchange,
                  market.base.symbol,
                  market.quote.symbol
                );
              } else {
                goToSpotMarket(exchange, market.base.symbol, market.quote.symbol);
              }
            }}
            className={cn("cursor-pointer transition-colors", {
              "row-active-market font-semibold": isActive,
            })}
          >
            <TableCell className="w-[150px] text-xs px-4 py-1 cursor-pointer">
              {market?.base?.symbol}-{market?.quote?.symbol}
            </TableCell>
            <TableCell className="text-xs px-4 py-1 cursor-pointer number text-right">
              {prices && prices[market?.market]?.price} {market?.quote?.symbol}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );

  return (
    <ExchangeWidget type="markets" header={header}>
      <Table>
        <TableBody>
          {marketsLoading ? (
            <>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="w-[150px] px-4 py-1">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-1 text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            realMarkets
          )}
        </TableBody>
      </Table>
    </ExchangeWidget>
  );
};
