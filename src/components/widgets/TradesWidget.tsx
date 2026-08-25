"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExchangeWidget } from "./ExchangeWidget";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext } from "react";
import { FormatAmount } from "../common/Formatters";
import { Skeleton } from "@/components/ui/skeleton";

export const TradesWidget: React.FC = () => {
  const {
    getters: {
      activeMarket: { trades, base, quote, initialTradesLoading },
    },
  } = useContext(ExchangeDataGettersContext);
  const header = (
    <>
      <div className="widget-title">Trades</div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
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
                <TableCell
                  className={cn(
                    "w-[150px] text-xs px-4 py-0.5 cursor-pointer number tabular-nums",
                    trade.side === "buy" ? "text-bid" : "text-ask"
                  )}
                >
                  <span>
                    <FormatAmount
                      amount={trade.price}
                      precision={quote?.precision}
                    />
                  </span>
                  <span> {trade.market.quote.symbol}</span>
                </TableCell>
                <TableCell className="text-xs px-4 py-1 cursor-pointer number text-right">
                  <span>
                    <FormatAmount
                      amount={trade.amount}
                      precision={base?.precision}
                    />
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
