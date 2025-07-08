import { AssetConfig, Balance, CreateOrderPayload, Order } from "@/types/lib";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormatAmount } from "@/components/common/Formatters";
import { cn } from "@/lib/utils";

type MarketOrderFormProps = {
  side: Order["side"];
  balance: Balance;
  asset: AssetConfig;
  baseAsset: AssetConfig;
  market: string;
  onSubmit: (payload: CreateOrderPayload) => void;
};

export const MarketOrderForm: React.FC<MarketOrderFormProps> = ({
  side,
  balance,
  asset,
  baseAsset,
  market,
  onSubmit: _onSubmit,
}) => {
  const formSchema = z.object({
    price: z.string(),
    amount: z.string().min(0).max(50),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      price: "Market price",
      amount: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: CreateOrderPayload = {
      type: "market",
      market,
      side,
      amount: values.amount,
    };
    _onSubmit(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-xs">
          Available:{" "}
          {balance ? (
            <span className="number">
              <FormatAmount
                amount={String(balance?.available)}
                precision={asset?.precision}
              />{" "}
              {asset?.symbol}
            </span>
          ) : (
            "-"
          )}
        </div>
        <FormField
          control={form.control}
          name="price"
          disabled
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel className="w-[120px] text-xs">Price</FormLabel>
                <FormControl className="w-full text-xs">
                  <Input {...field} autoComplete="off" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel className="w-[120px] text-xs">Amount</FormLabel>
                <FormControl className="w-full text-xs relative">
                  <div>
                    <Input {...field} autoComplete="off" />
                    <span className="absolute right-2 top-2">
                      {baseAsset?.symbol}
                    </span>
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          size="sm"
          variant="secondary"
          className={cn({
            "bg-green-800": side === "buy",
            "bg-red-800": side === "sell",
          })}
          type="submit"
        >
          Create {side} order
        </Button>
      </form>
    </Form>
  );
};
