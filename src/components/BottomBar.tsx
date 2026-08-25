import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext } from "react";

const ConnectionStatus = () => {
  const {
    getters: {
      activeExchange: { isConnected, exchange },
    },
  } = useContext(ExchangeDataGettersContext);

  if (isConnected) {
    return (
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bid opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-bid" />
        </span>
        <span className="text-muted-foreground">
          Connected to{" "}
          <span className="text-foreground font-medium capitalize">
            {exchange}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <span className="inline-flex rounded-full h-2 w-2 bg-muted-foreground/40" />
      Not connected
    </span>
  );
};

export const BottomBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card text-xs pl-4 py-2 border-t border-border">
      <ConnectionStatus />
    </div>
  );
};
