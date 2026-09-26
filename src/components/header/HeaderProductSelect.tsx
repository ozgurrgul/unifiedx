"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TradingProduct } from "@/context/TradingProductContext";
import { cn } from "@/lib/utils";

type HeaderProductSelectProps = {
  value: TradingProduct;
  onSelect: (product: TradingProduct) => void;
};

export const HeaderProductSelect = ({ value, onSelect }: HeaderProductSelectProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="product-select"
          className="exchange-pill flex items-center gap-1.5 capitalize min-w-[88px] justify-between exchange-pill-active"
        >
          {value}
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-36 p-1">
        {(["spot", "perp"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            data-testid={`product-option-${mode}`}
            className={cn(
              "w-full text-left px-2 py-1.5 text-xs rounded-md capitalize hover:bg-secondary transition-colors",
              value === mode && "bg-secondary font-semibold"
            )}
            onClick={() => onSelect(mode)}
          >
            {mode}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
