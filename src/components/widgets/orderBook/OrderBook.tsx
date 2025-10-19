import { ComputedOrderBookData, ShapedBookEntry } from "./types";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import { cn } from "@/lib/utils";
import { AssetConfig, Trade } from "@/types/lib";
import { useContext } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { FormatAmount } from "../../common/Formatters";

type Props = {
  data?: ComputedOrderBookData;
};

type BookProps = {
  type: Trade["side"];
  entries: ShapedBookEntry[];
  total?: number;
  base: AssetConfig;
  quote: AssetConfig;
};

const BookRenderer: React.FC<BookProps> = ({
  type,
  entries,
  total,
  base,
  quote,
}) => {
  const bgColor: { [key in Trade["side"]]: string } = {
    buy: "rgba(19, 100, 0, 0.16)",
    sell: "rgba(255, 1, 1, 0.16)",
  };
  return (
    <Table>
      <TableBody>
        {entries.map((entry, index) => {
          // quote symbol precision
          const totalRatio = total ? (entry.t / total) * 100 : 0;
          const basePrecision = base?.precision || 5;
          const quotePrecision = Math.min(5, quote?.precision || 5);
          return (
            <TableRow
              key={entry.k || index}
              style={{
                background: `linear-gradient(90deg, ${bgColor[type]} ${totalRatio}%, transparent ${totalRatio}%)`,
              }}
            >
              <TableCell
                className={cn(
                  "font-medium text-xs w-[100px] px-2 py-1 cursor-pointer",
                  {
                    "text-green-400": type === "buy",
                    "text-red-400": type === "sell",
                  }
                )}
              >
                <FormatAmount amount={entry.p} precision={quotePrecision} />
              </TableCell>
              <TableCell className="text-xs px-4 py-1 cursor-pointer number text-right">
                <FormatAmount amount={entry.a} precision={basePrecision} />
              </TableCell>
              <TableCell className="text-xs px-2 py-1 cursor-pointer number text-right">
                <FormatAmount
                  amount={String(entry.t)}
                  precision={quotePrecision}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export const OrderBook: React.FC<Props> = ({ data }) => {
  const {
    getters: {
      activeMarket: { base, quote },
    },
  } = useContext(ExchangeDataGettersContext);
  const stats = (
    <div className="flex items-center py-2 justify-evenly">
      <span className="text-xs text-gray-500">
        Spread: {data?.spreadPercentage}
      </span>
      {/* <span className="text-xs text-gray-500">Mid: {data?.midMarketPrice}</span> */}
    </div>
  );

  return (
    <div>
      <BookRenderer
        type="sell"
        entries={data?.asks || []}
        total={data?.sumOfAsksTotal}
        base={base}
        quote={quote}
      />
      {stats}
      <BookRenderer
        type="buy"
        entries={data?.bids || []}
        total={data?.sumOfBidsTotal}
        base={base}
        quote={quote}
      />
    </div>
  );
};
