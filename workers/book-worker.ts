import { Book } from "@/components/widgets/orderBook/utils/Book";
import { BookWorkerPayload } from "./BookWorkerTypes";

const book = new Book();

addEventListener("message", (event: MessageEvent<BookWorkerPayload>) => {
  const { type, quoteAssetPrecision, bookData, visibleRows } = event.data;
  if (type === "snapshot") {
    const b = book
      .reset()
      .setSnapshot(bookData)
      .setOrderBookTableVisibleRowsCount(visibleRows);

    postMessage({
      limited: b.getData(
        book._orderBookTableVisibleRowsCount,
        quoteAssetPrecision
      ),
      all: b.getData(500, quoteAssetPrecision),
    });
  } else if (type === "update") {
    const b = book.update(bookData);

    postMessage({
      limited: b.getData(
        book._orderBookTableVisibleRowsCount,
        quoteAssetPrecision
      ),
      all: b.getData(500, quoteAssetPrecision),
    });
  }
});
