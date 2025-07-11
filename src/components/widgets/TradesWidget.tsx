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

export const TradesWidget: React.FC = () => {
  const {
    getters: {
      activeMarket: { trades, base, quote },
    },
  } = useContext(ExchangeDataGettersContext);
  const header = (
    <>
      <div className="p-4 pb-2 font-medium text-xs">Trades</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 w-[150px] text-xs">Price</TableHead>
            <TableHead className="h-8 w-[100px] text-xs">Amount</TableHead>
            <TableHead className="h-8 text-xs text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>
  );
  return (
    <ExchangeWidget type="trades" header={header}>
      <Table>
        <TableBody>
          {(trades || []).map((trade) => {
            return (
              <TableRow key={`${trade.id}`}>
                <TableCell
                  className={cn("w-[150px] text-xs px-4 py-1 cursor-pointer", {
                    "text-red-400": trade.side === "buy",
                    "text-green-400": trade.side === "sell",
                  })}
                >
                  <FormatAmount
                    amount={trade.price}
                    precision={trade?.market?.quote?.precision || 4}
                  />
                </TableCell>
                <TableCell className="w-[100px] text-xs px-4 py-1 cursor-pointer number">
                  <FormatAmount
                    amount={trade.amount}
                    precision={trade?.market?.base?.precision || 4}
                  />
                </TableCell>
                <TableCell className="text-xs px-4 py-1 cursor-pointer number text-right">
                  20:55
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ExchangeWidget>
  );
};
