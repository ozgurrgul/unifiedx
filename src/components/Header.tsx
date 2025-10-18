"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useContext, useState } from "react";
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
import { Loader } from "lucide-react";

export const Header = () => {
  const { goToExchange } = useAppNavigation();
  const {
    getters: {
      activeExchange: { exchange, isAuthenticated },
    },
  } = useContext(ExchangeDataGettersContext);

  const [showCredentials, setShowCredentials] = useState(false);

  return (
    <div className="flex items-center w-full" style={{ gridArea: "header" }}>
      <Menubar className="w-full">
        <MenubarMenu>
          <MenubarTrigger>UnifiedX</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              About <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            {exchange ? `Active: ${exchange}` : "Choose exchange"}
          </MenubarTrigger>
          <MenubarContent>
            {/* Render exchange options */}
            <MenubarRadioGroup value={String(exchange)}>
              {Object.keys(exchangeConfigs).map((exchange) => (
                <MenubarRadioItem
                  key={exchange}
                  value={exchange}
                  onClick={() => {
                    const exchangeCasted = exchange as ExchangeType;
                    goToExchange(exchangeCasted);
                  }}
                >
                  {exchange}
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
        {exchange && (
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setShowCredentials(true)}
              className="cursor-pointer flex items-center gap-2"
            >
              <span>Credentials</span>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <span>
                      {isAuthenticated === "loading" && (
                        <Loader className="animate-spin" />
                      )}
                      {isAuthenticated === "yes" && (
                        <LockClosedIcon className="text-green-500" />
                      )}
                      {isAuthenticated === "no" && (
                        <LockOpen2Icon className="text-red-500" />
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
            </MenubarTrigger>
          </MenubarMenu>
        )}
      </Menubar>
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
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
