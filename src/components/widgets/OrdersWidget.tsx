"use client";

import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExchangeWidget } from "./ExchangeWidget";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types/lib";
import { FormatAmount } from "../common/Formatters";
import { Button } from "../ui/button";
import { $bus, BusEvent } from "../ExchangeBus";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { cn } from "@/lib/utils";

const TableHeaderRenderer: React.FC<{
  onClickCancel?: (order: Order) => void;
}> = ({ onClickCancel }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 text-xs w-[200px]">Market</TableHead>
          <TableHead className="h-8 text-xs w-[100px]">Side</TableHead>
          <TableHead className="h-8 text-xs w-[100px]">Type</TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">
            Amount
          </TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">
            Filled
          </TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">
            Price
          </TableHead>
          <TableHead className="h-8 text-xs text-right w-[240px]">
            Status
          </TableHead>
          <TableHead className="h-8 text-xs text-right">Action</TableHead>
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
  // if (!orders.length) {
  //   return (
  //     <>
  //       <Table>{renderHeader()}</Table>
  //       <div className="flex justify-center p-6 text-sm">No open orders</div>
  //     </>
  //   );
  // }
  return (
    <Table>
      <TableBody>
        {orders.map((order) => {
          return (
            <TableRow key={order.id}>
              <TableCell
                className="w-[200px] underline cursor-pointer text-xs"
                onClick={() => onClickMarket(order)}
              >
                {order.baseAssetSymbol}-{order.quoteAssetSymbol}
              </TableCell>
              <TableCell
                className={cn("w-[100px] text-xs", {
                  "text-green-400": order.side === "buy",
                  "text-red-400": order.side === "sell",
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

export const OrdersWidget = () => {
  const { goToMarket } = useAppNavigation();
  const [activeTab, setActiveTab] = useState<
    "open-orders" | "all-open-orders" | "order-history"
  >("open-orders");
  const {
    getters: {
      activeExchange: { exchange },
      activeMarket: { base, openOrders, cancellingOrderIds, pastOrders },
    },
  } = useContext(ExchangeDataGettersContext);

  const baseOpenOrders = openOrders.filter(
    (r) => r.baseAssetSymbol === base?.symbol
  );

  const cancelOrder = (order: Order) => {
    $bus.emit(BusEvent.CancelOrder, order);
  };

  const onClickMarket = (order: Order) => {
    goToMarket(exchange, order.baseAssetSymbol, order.quoteAssetSymbol);
  };

  const header = (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(e) => {
          setActiveTab(e as any);
        }}
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="open-orders">
            {base?.symbol} open orders
          </TabsTrigger>
          <TabsTrigger value="all-open-orders">All open orders</TabsTrigger>
          <TabsTrigger value="order-history">
            {base?.symbol} order history
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <TableHeaderRenderer
        onClickCancel={activeTab === "order-history" ? undefined : cancelOrder}
      />
    </>
  );

  return (
    <ExchangeWidget type="open-orders" header={header}>
      {activeTab === "open-orders" && (
        <OrdersTable
          orders={baseOpenOrders}
          onClickCancel={cancelOrder}
          onClickMarket={onClickMarket}
          cancellingOrderIds={cancellingOrderIds}
        />
      )}
      {activeTab === "all-open-orders" && (
        <OrdersTable
          orders={openOrders}
          onClickCancel={cancelOrder}
          cancellingOrderIds={cancellingOrderIds}
          onClickMarket={onClickMarket}
        />
      )}
      {activeTab === "order-history" && (
        <OrdersTable
          orders={pastOrders}
          cancellingOrderIds={[]}
          onClickMarket={onClickMarket}
        />
      )}
    </ExchangeWidget>
  );
};
