import Image from "next/image";
import { exchangeLogos } from "@/data/exchangeBranding";
import type { ExchangeType } from "@/data/exchangeConfigs";
import { cn } from "@/lib/utils";

type ExchangeLogoProps = {
  exchange: ExchangeType;
  size?: number;
  className?: string;
};

export const ExchangeLogo = ({ exchange, size = 16, className }: ExchangeLogoProps) => {
  return (
    <Image
      src={exchangeLogos[exchange]}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
};
