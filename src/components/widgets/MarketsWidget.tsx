"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Market, MarketsHashmap } from "@/types/lib";
import { Input } from "../ui/input";
import { useContext, useEffect, useState } from "react";
import { ExchangeWidget } from "./ExchangeWidget";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import Fuse from "fuse.js";
import { Skeleton } from "../ui/skeleton";

const getUniqueMarketQuotes = (markets: MarketsHashmap) => {
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
            <div
              key={quote}
              className={cn(
                "text-xs hover:font-bold cursor-pointer flex justify-center items-center radius-2",
                {
                  "font-bold": isActive,
                  "border-2": isActive,
                  "rounded-sm": isActive,
                }
              )}
              onClick={() => onSelect(quote)}
            >
              {quote}
            </div>
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
      activeMarket: { market: activeMarket, markets, prices },
    },
  } = useContext(ExchangeDataGettersContext);
  const { goToMarket } = useAppNavigation();

  const [searchInputText, setSearchInputText] = useState("");
  const marketQuoteSymbols = getUniqueMarketQuotes(markets);
  const visibleMarketQuoteSymbols =
    marketQuoteSymbols.length > 5
      ? marketQuoteSymbols.slice(0, 5)
      : marketQuoteSymbols;

  const [viewingMarketQuote, setViewingMarketQuote] = useState<string>();

  useEffect(() => {
    if (visibleMarketQuoteSymbols && visibleMarketQuoteSymbols.length > 0) {
      const firstQuote = visibleMarketQuoteSymbols[0];
      setViewingMarketQuote(firstQuote);
    }
  }, [JSON.stringify(visibleMarketQuoteSymbols)]);

  const getMarketsByQuote = (_markets: Market[]) => {
    if (!viewingMarketQuote) {
      return _markets;
    }

    return _markets.filter((r) => r.quote.symbol === viewingMarketQuote);
  };

  const getMarkets = () => {
    const marketsArray = Object.values(markets);
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
          placeholder="Search"
          onChange={(e) => setSearchInputText(e.target.value)}
          className="bg-muted"
          value={searchInputText}
        />
      </div>
      <Tabs
        key={viewingMarketQuote}
        defaultValue={viewingMarketQuote}
        className="w-full px-2"
      >
        <TabsList className="w-full justify-start h-8">
          {visibleMarketQuoteSymbols?.map((quoteSymbol) => (
            <TabsTrigger
              key={quoteSymbol}
              value={quoteSymbol}
              onClick={() => setViewingMarketQuote(quoteSymbol)}
              className="text-xs"
            >
              {quoteSymbol}
            </TabsTrigger>
          ))}
          {visibleMarketQuoteSymbols?.length < marketQuoteSymbols?.length && (
            <RemaningMarkets
              viewingMarketQuote={viewingMarketQuote}
              visibleMarketQuoteSymbols={visibleMarketQuoteSymbols}
              marketQuoteSymbols={marketQuoteSymbols}
              onSelect={(quote) => setViewingMarketQuote(quote)}
            />
          )}
        </TabsList>
      </Tabs>
      <Table className="pt-2">
        <TableHeader className="w-full">
          <TableRow>
            <TableHead className="h-8 px-4 text-xs w-[150px]">Market</TableHead>
            <TableHead className="h-8 px-4 text-xs text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>
  );

  const realMarkets = (
    <>
      {getMarkets().map((market) => {
        const price = prices && prices[market.market]?.price;
        const isActive = market.market === activeMarket;
        return (
          <TableRow
            key={`${market.market}-${price}`}
            onClick={() => {
              goToMarket(exchange, market.base.symbol, market.quote.symbol);
            }}
            className={cn({
              "font-medium": isActive,
              "bg-foreground/10": isActive,
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
