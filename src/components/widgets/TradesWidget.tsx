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
      <div className="p-4 pb-2 font-medium text-xs">Trades</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 w-[150px] text-xs">Price</TableHead>
            <TableHead className="h-8 text-xs text-right">Amount</TableHead>
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
                    "w-[150px] text-xs px-4 py-1 cursor-pointer number",
                    {
                      "text-red-400": trade.side === "buy",
                      "text-green-400": trade.side === "sell",
                    }
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
