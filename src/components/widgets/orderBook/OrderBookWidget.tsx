import { OrderBook } from "./OrderBook";
import { ExchangeWidget } from "../ExchangeWidget";
import {
  TableHeader,
  TableRow,
  TableHead,
  Table,
  TableCell,
} from "../../ui/table";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext, useEffect, useRef } from "react";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";
import { Skeleton } from "@/components/ui/skeleton";

export const OrderBookWidget: React.FC = () => {
  const {
    getters: {
      activeMarket: { computedOrderBookData, base, quote, orderBookLoading },
    },
  } = useContext(ExchangeDataGettersContext);

  const {
    setters: { updateVisibleOrderBookRowsNumber },
  } = useContext(ExchangeDataSettersContext);

  useEffect(() => {
    const dom = document.querySelector(".widget-order-book");
    if (!dom) {
      return;
    }
    const header = dom.querySelector(".widget-card-header");
    const headerHeight = header?.clientHeight || 0;
    const statsHeight = 32;
    const bookRowHeight = 24;
    const availableRows = Math.ceil(
      (dom.clientHeight - statsHeight - headerHeight) / (2 * bookRowHeight)
    );
    updateVisibleOrderBookRowsNumber(availableRows);
  }, []);

  const header = (
    <>
      <div className="p-4 pb-2 font-medium text-xs">Order Book</div>
      <Table>
        <TableHeader className="w-full">
          <TableRow>
            <TableHead className="h-8 text-xs w-[100px] px-2">
              Price ({quote?.symbol})
            </TableHead>
            <TableHead className="h-8 text-xs px-4">
              Amount ({base?.symbol})
            </TableHead>
            <TableHead className="h-8 text-xs px-2 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>
  );
  return (
    <ExchangeWidget type="order-book" header={header}>
      {orderBookLoading ? (
        <>
          {Array.from({ length: 20 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell className="w-[100px] px-2">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </>
      ) : (
        <OrderBook data={computedOrderBookData} />
      )}
    </ExchangeWidget>
  );
};
