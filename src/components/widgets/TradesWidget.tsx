"use client";

import { useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { cn } from "@/lib/utils";
import { FormatAmount } from "../common/Formatters";
import { ExchangeWidget } from "./ExchangeWidget";

function formatTradeTimestamp(timestamp: number): string {
  const ms = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export const TradesWidget: React.FC = () => {
  const {
    getters: {
      activeSpotMarket: { trades, base, quote, initialTradesLoading },
    },
  } = useContext(ExchangeDataGettersContext);
  const header = (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-7 w-[72px] text-[10px] uppercase tracking-wider">
              Time
            </TableHead>
            <TableHead className="h-7 w-[150px] text-[10px] uppercase tracking-wider">
              Price
            </TableHead>
            <TableHead className="h-7 text-[10px] uppercase tracking-wider text-right">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>
  );
  return (
    <ExchangeWidget type="trades" header={header}>
      {initialTradesLoading ? (
        <Table>
          <TableBody>
            {Array.from({ length: 15 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell className="w-[72px] px-4 py-1">
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell className="w-[150px] px-4 py-1">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-1 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableBody>
            {(trades || []).map((trade) => {
              return (
                <TableRow key={`${trade.id}`}>
                  <TableCell className="w-[72px] text-xs px-4 py-0.5 text-muted-foreground tabular-nums">
                    {formatTradeTimestamp(trade.timestamp)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "w-[150px] text-xs px-4 py-0.5 cursor-pointer number tabular-nums",
                      trade.side === "buy" ? "text-bid" : "text-ask"
                    )}
                  >
                    <span>
                      <FormatAmount amount={trade.price} precision={quote?.precision} />
                    </span>
                    <span> {trade.market.quote.symbol}</span>
                  </TableCell>
                  <TableCell className="text-xs px-4 py-1 cursor-pointer number text-right">
                    <span>
                      <FormatAmount amount={trade.amount} precision={base?.precision} />
                    </span>
                    <span> {trade.market.base.symbol}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </ExchangeWidget>
  );
};
