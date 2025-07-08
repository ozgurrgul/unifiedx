export type ShapedBookEntry = {
  a: string; // amount
  p: string; // price
  t: number; // total
  k?: string; // key
};
export type ComputedOrderBookData = {
  market: string;
  asks: ShapedBookEntry[];
  bids: ShapedBookEntry[];
  spreadPercentage: string;
  midMarketPrice: number;
  sumOfAsksTotal: number;
  sumOfBidsTotal: number;
};
