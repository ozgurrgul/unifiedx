"use client";

import { useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/lib";
import {
  AuthenticatedAccountPrompt,
  useAccountGatedContent,
} from "../../common/AuthenticatedAccountPrompt";
import { FormatAmount } from "../../common/Formatters";
import { $bus, BusEvent } from "../../ExchangeBus";
import { Button } from "../../ui/button";
import { ExchangeWidget } from "../ExchangeWidget";

const TableHeaderRenderer: React.FC<{
  showCancel?: boolean;
}> = ({ showCancel = true }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 text-xs w-[200px]">Market</TableHead>
          <TableHead className="h-8 text-xs w-[100px]">Side</TableHead>
          <TableHead className="h-8 text-xs w-[100px]">Type</TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">Amount</TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">Filled</TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">Price</TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">Status</TableHead>
          {showCancel && (
            <TableHead className="h-8 text-xs text-right">Action</TableHead>
          )}
        </TableRow>
      </TableHeader>
    </Table>
  );
};

const OrdersTable: React.FC<{
  orders: Order[];
  onClickCancel?: (order: Order) => void;
  onClickMarket: (order: Order) => void;
  cancellingOrderIds: string[];
}> = ({ orders, onClickCancel, onClickMarket, cancellingOrderIds }) => {
  return (
    <Table>
      <TableBody>
        {orders.map((order) => {
          return (
            <TableRow key={order.id}>
              <TableCell
                className="w-[200px] text-foreground cursor-pointer text-xs hover:underline"
                onClick={() => onClickMarket(order)}
              >
                {order.baseAssetSymbol}-{order.quoteAssetSymbol}
              </TableCell>
              <TableCell
                className={cn("w-[100px] text-xs capitalize", {
                  "text-bid": order.side === "buy",
                  "text-ask": order.side === "sell",
                })}
              >
                {order.side}
              </TableCell>
              <TableCell className="text-xs w-[100px]">{order.type}</TableCell>
              <TableCell className="text-right number text-xs w-[240px]">
                <FormatAmount amount={order.amount} precision={8} />{" "}
                {order.baseAssetSymbol}
              </TableCell>
              <TableCell className="text-right number text-xs w-[240px]">
                <FormatAmount amount={order.filledAmount} precision={8} />{" "}
                {order.baseAssetSymbol}
              </TableCell>
              <TableCell className="text-right number text-xs w-[240px]">
                <FormatAmount amount={order.price} precision={2} />{" "}
                {order.quoteAssetSymbol}
              </TableCell>
              <TableCell className="text-xs text-right w-[240px]">
                {order.status}
              </TableCell>
              <TableCell className="text-right text-xs">
                {onClickCancel ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6"
                    onClick={() => onClickCancel(order)}
                    disabled={cancellingOrderIds.includes(order.id)}
                  >
                    cancel
                  </Button>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

function useOrdersActions() {
  const { goToMarket } = useAppNavigation();
  const {
    getters: {
      activeExchange: { exchange },
    },
  } = useContext(ExchangeDataGettersContext);

  const cancelOrder = (order: Order) => {
    $bus.emit(BusEvent.CancelOrder, order);
  };

  const onClickMarket = (order: Order) => {
    goToMarket(exchange, order.baseAssetSymbol, order.quoteAssetSymbol);
  };

  return { cancelOrder, onClickMarket };
}

function AccountGatedOrdersBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showSignInPrompt } = useAccountGatedContent();
  if (showSignInPrompt) {
    return <AuthenticatedAccountPrompt />;
  }
  return children;
}

export const BaseOpenOrdersPanel = () => {
  const {
    getters: {
      activeMarket: { base, openOrders, cancellingOrderIds },
    },
  } = useContext(ExchangeDataGettersContext);
  const { cancelOrder, onClickMarket } = useOrdersActions();

  const baseOpenOrders = openOrders.filter((r) => r.baseAssetSymbol === base?.symbol);

  return (
    <ExchangeWidget type="base-open-orders" header={<TableHeaderRenderer />}>
      <AccountGatedOrdersBody>
        <OrdersTable
          orders={baseOpenOrders}
          onClickCancel={cancelOrder}
          onClickMarket={onClickMarket}
          cancellingOrderIds={cancellingOrderIds}
        />
      </AccountGatedOrdersBody>
    </ExchangeWidget>
  );
};

export const AllOpenOrdersPanel = () => {
  const {
    getters: {
      activeMarket: { openOrders, cancellingOrderIds },
    },
  } = useContext(ExchangeDataGettersContext);
  const { cancelOrder, onClickMarket } = useOrdersActions();

  return (
    <ExchangeWidget type="all-open-orders" header={<TableHeaderRenderer />}>
      <AccountGatedOrdersBody>
        <OrdersTable
          orders={openOrders}
          onClickCancel={cancelOrder}
          cancellingOrderIds={cancellingOrderIds}
          onClickMarket={onClickMarket}
        />
      </AccountGatedOrdersBody>
    </ExchangeWidget>
  );
};

export const OrderHistoryPanel = () => {
  const {
    getters: {
      activeMarket: { pastOrders },
    },
  } = useContext(ExchangeDataGettersContext);
  const { onClickMarket } = useOrdersActions();

  return (
    <ExchangeWidget
      type="order-history"
      header={<TableHeaderRenderer showCancel={false} />}
    >
      <AccountGatedOrdersBody>
        <OrdersTable
          orders={pastOrders}
          cancellingOrderIds={[]}
          onClickMarket={onClickMarket}
        />
      </AccountGatedOrdersBody>
    </ExchangeWidget>
  );
};
