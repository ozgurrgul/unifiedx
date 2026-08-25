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

export const BalancesWidget: React.FC = () => {
  const {
    getters: {
      activeMarket: { balances, base, quote },
    },
  } = useContext(ExchangeDataGettersContext);

  const header = (
    <>
      <div className="widget-title">Balances</div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-7 w-[80px] text-[10px] uppercase tracking-wider">
              Asset
            </TableHead>
            <TableHead className="h-7 text-[10px] uppercase tracking-wider">
              Available
            </TableHead>
            <TableHead className="h-7 text-[10px] uppercase tracking-wider text-right">
              In order
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>
  );

  const sortedBalances = balances
    ? Object.values(balances).sort((b1, b2) => b2.available - b1.available)
    : [];

  return (
    <ExchangeWidget type="balances" header={header}>
      <Table>
        <TableBody>
          {sortedBalances.map((balance) => {
            const activeAsset =
              balance.asset === base.symbol || balance.asset === quote.symbol;
            return (
              <TableRow
                key={`${balance.asset}`}
                className={cn({
                  "row-active": activeAsset,
                })}
              >
                <TableCell className="w-[80px] text-xs px-4 py-1">
                  {balance.asset}
                </TableCell>
                <TableCell className="text-xs px-4 py-1 number">
                  <FormatAmount
                    amount={String(balance.available)}
                    precision={6}
                  />
                </TableCell>
                <TableCell className="text-xs px-4 py-1 number text-right">
                  <FormatAmount
                    amount={String(balance.inOrder)}
                    precision={6}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ExchangeWidget>
  );
};
