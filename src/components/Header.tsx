"use client";

import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";
import { Loader, Moon, RotateCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useTradingProduct } from "@/context/TradingProductContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { type ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { isPerpSupportedExchange } from "@/data/perp/exchangeConfigs";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { ExchangeCrendentials } from "./ExchangeCrendentials";
import { HeaderExchangeSelect } from "./header/HeaderExchangeSelect";
import { HeaderProductSelect } from "./header/HeaderProductSelect";
import { useOptionalDockLayoutControl } from "./layout/DockLayoutControlContext";

export const Header = () => {
  const router = useRouter();
  const product = useTradingProduct();
  const { goToExchange, goToSpotMarket, goToPerpExchange } = useAppNavigation();
  const {
    getters: {
      activeExchange: { exchange, isAuthenticated },
      activeSpotMarket: { spotMarketId },
    },
  } = useContext(ExchangeDataGettersContext);

  const [showCredentials, setShowCredentials] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dockLayoutControl = useOptionalDockLayoutControl();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onExchangeSelect = (ex: ExchangeType) => {
    if (isPerpSupportedExchange(ex) && (product === "perp" || ex === "helloTrade")) {
      goToPerpExchange(ex);
      return;
    }
    goToExchange(ex);
  };

  const onProductSelect = (mode: "spot" | "perp") => {
    if (exchange !== "binance" || !spotMarketId) {
      return;
    }
    const [base, quote] = spotMarketId.split("-");
    if (mode === "spot") {
      goToSpotMarket("binance", base, quote);
    } else {
      goToPerpExchange("binance");
    }
  };

  const showProductSelect =
    exchange === "binance" &&
    Boolean(spotMarketId) &&
    router.pathname.includes("/market/");

  return (
    <div className="app-header flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold tracking-tight text-foreground">
          UnifiedX
        </span>

        <HeaderExchangeSelect value={exchange} onSelect={onExchangeSelect} />

        {showProductSelect && (
          <HeaderProductSelect value={product} onSelect={onProductSelect} />
        )}
      </div>

      <div className="flex items-center gap-2">
        {exchange && (
          <button
            type="button"
            onClick={() => setShowCredentials(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <span>Credentials</span>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <span>
                    {isAuthenticated === "loading" && (
                      <Loader className="animate-spin w-3.5 h-3.5" />
                    )}
                    {isAuthenticated === "yes" && (
                      <LockClosedIcon className="text-bid w-3.5 h-3.5" />
                    )}
                    {isAuthenticated === "no" && (
                      <LockOpen2Icon className="text-ask w-3.5 h-3.5" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isAuthenticated === "yes"
                      ? "Authenticated successfully"
                      : "Not authenticated"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </button>
        )}

        {dockLayoutControl && (
          <button
            type="button"
            data-testid="reset-dock-layout"
            disabled={!dockLayoutControl.canResetLayout}
            onClick={dockLayoutControl.resetLayout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset layout
          </button>
        )}

        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <span className="block w-4 h-4" />
          ) : resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Set or update your credentials for {exchange}</DialogTitle>
            <ExchangeCrendentials
              activeExchange={exchange as ExchangeType}
              onClose={() => document.location.reload()}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
