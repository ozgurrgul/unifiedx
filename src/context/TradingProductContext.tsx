import { createContext, useContext } from "react";

export type TradingProduct = "spot" | "perp";

const TradingProductContext = createContext<TradingProduct>("spot");

export const TradingProductProvider = ({
  product,
  children,
}: {
  product: TradingProduct;
  children: React.ReactNode;
}) => (
  <TradingProductContext.Provider value={product}>{children}</TradingProductContext.Provider>
);

export const useTradingProduct = () => useContext(TradingProductContext);
