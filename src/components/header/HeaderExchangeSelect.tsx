"use client";

import { ChevronDown } from "lucide-react";
import { ExchangeLogo } from "@/components/ExchangeLogo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exchangeLabels } from "@/data/exchangeBranding";
import { spotExchangeConfigs, type ExchangeType, type SpotExchangeType } from "@/data/exchangeConfigs";
import { perpExchangeConfigs } from "@/data/perp/exchangeConfigs";
import type { PerpSupportedExchange } from "@/data/perp/types";
import { cn } from "@/lib/utils";

const headerExchangeIds: ExchangeType[] = [
  ...(Object.keys(spotExchangeConfigs) as SpotExchangeType[]),
  ...(Object.keys(perpExchangeConfigs) as PerpSupportedExchange[]).filter(
    (id) => !(id in spotExchangeConfigs)
  ),
];

type HeaderExchangeSelectProps = {
  value?: ExchangeType | "";
  onSelect: (exchange: ExchangeType) => void;
};

export const HeaderExchangeSelect = ({ value, onSelect }: HeaderExchangeSelectProps) => {
  const label = value ? exchangeLabels[value] : "Exchange";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="exchange-select"
          className={cn(
            "exchange-pill flex items-center gap-1.5 capitalize min-w-[120px] justify-between",
            value && "exchange-pill-active"
          )}
        >
          <span className="flex items-center gap-1.5">
            {value ? <ExchangeLogo exchange={value} size={14} /> : null}
            {label}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-1">
        {headerExchangeIds.map((ex) => (
          <button
            key={ex}
            type="button"
            data-testid={`exchange-option-${ex}`}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md capitalize hover:bg-secondary transition-colors",
              value === ex && "bg-secondary font-semibold"
            )}
            onClick={() => onSelect(ex)}
          >
            <ExchangeLogo exchange={ex} size={14} />
            {exchangeLabels[ex]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
