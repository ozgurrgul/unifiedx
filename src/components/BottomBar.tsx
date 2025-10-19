import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { useContext } from "react";

const ConnectionStatus = () => {
  const {
    getters: {
      activeExchange: { isConnected, error, exchange },
    },
  } = useContext(ExchangeDataGettersContext);

  if (isConnected) {
    return <span>Connected to {exchange}</span>;
  }

  return <span>Not connected</span>;
};

export const BottomBar = () => {
  const {
    getters: {
      activeExchange: { isConnected, error, exchange },
    },
  } = useContext(ExchangeDataGettersContext);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background text-primary text-xs pl-4 py-2 border-t">
      <ConnectionStatus />
    </div>
  );
};
