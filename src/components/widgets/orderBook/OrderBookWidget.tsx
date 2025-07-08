import { OrderBook } from "./OrderBook";
import { ExchangeWidget } from "../ExchangeWidget";
import { TableHeader, TableRow, TableHead, Table } from "../../ui/table";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext, useEffect, useRef } from "react";
import { ExchangeDataSettersContext } from "@/data/ExchangeDataSettersContext";

export const OrderBookWidget: React.FC = () => {
  const {
    getters: {
      activeMarket: { computedOrderBookData, base, quote },
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
    const statsHeight = 48;
    const bookRowHeight = 24;
    const availableRows = Math.floor(
      (dom.clientHeight - statsHeight) / (2 * bookRowHeight)
    );
    updateVisibleOrderBookRowsNumber(availableRows);
  }, []);

  const header = (
    <>
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
      <OrderBook data={computedOrderBookData} />
    </ExchangeWidget>
  );
};
