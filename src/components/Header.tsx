"use client";

import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExchangeCrendentials } from "./ExchangeCrendentials";
import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { goToExchange } = useAppNavigation();
  const {
    getters: {
      activeExchange: { exchange, isAuthenticated },
    },
  } = useContext(ExchangeDataGettersContext);

  const [showCredentials, setShowCredentials] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="app-header flex items-center justify-between px-4"
      style={{ gridArea: "header" }}
    >
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold tracking-tight text-foreground">
          UnifiedX
        </span>

        <div className="flex items-center gap-0.5">
          {Object.keys(exchangeConfigs).map((ex) => (
            <button
              type="button"
              key={ex}
              className={cn("exchange-pill capitalize", {
                "exchange-pill-active": exchange === ex,
              })}
              onClick={() => goToExchange(ex as ExchangeType)}
            >
              {ex}
            </button>
          ))}
        </div>
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

        <button
          type="button"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
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
            <DialogTitle>
              Set or update your credentials for {exchange}
            </DialogTitle>
            <ExchangeCrendentials
              activeExchange={exchange}
              onClose={() => document.location.reload()}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
