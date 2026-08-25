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
  const bgVar = type === "buy" ? "var(--bid-muted)" : "var(--ask-muted)";
  return (
    <Table>
      <TableBody>
        {entries.map((entry, index) => {
          const totalRatio = total ? (entry.t / total) * 100 : 0;
          return (
            <TableRow
              key={entry.k || index}
              style={{
                background: `linear-gradient(90deg, hsl(${bgVar}) ${totalRatio}%, transparent ${totalRatio}%)`,
              }}
            >
              <TableCell
                className={cn(
                  "font-medium text-xs w-[100px] px-2 py-0.5 cursor-pointer tabular-nums",
                  type === "buy" ? "text-bid" : "text-ask"
                )}
              >
                <FormatAmount amount={entry.p} precision={quote.precision} />
              </TableCell>
              <TableCell className="text-xs px-4 py-0.5 cursor-pointer number text-right">
                <FormatAmount amount={entry.a} precision={base.precision} />
              </TableCell>
              <TableCell className="text-xs px-2 py-0.5 cursor-pointer number text-right text-muted-foreground">
                <FormatAmount
                  amount={String(entry.t)}
                  precision={quote.precision}
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
    <div className="flex items-center py-1.5 justify-center border-y border-border bg-secondary/30">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        Spread:{" "}
        <span className="text-foreground font-medium">
          {data?.spreadPercentage}
        </span>
      </span>
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
