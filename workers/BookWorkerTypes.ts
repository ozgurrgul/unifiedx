import { BookData } from "@/types/lib";

export type BookWorkerPayload = {
  bookData?: BookData;
  visibleRows: number;
  type: "snapshot" | "update" | "update-visible-rows-number";
  quoteAssetPrecision: number;
};
