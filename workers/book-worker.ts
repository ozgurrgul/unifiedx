import { Book } from "@/components/widgets/orderBook/utils/Book";
import { BookData } from "@/types/lib";

const book = new Book();

addEventListener(
  "message",
  (
    event: MessageEvent<{
      bookData?: BookData;
      visibleRows: number;
      type: "snapshot" | "update" | "update-visible-rows-number";
    }>
  ) => {
    if (event.data.type === "snapshot") {
      const b = book
        .reset()
        .setSnapshot(event.data.bookData)
        .setOrderBookTableVisibleRowsCount(event.data.visibleRows);
      postMessage({
        limited: b.getData(book._orderBookTableVisibleRowsCount),
        all: b.getData(500),
      });
    } else if (event.data.type === "update") {
      const b = book.update(event.data.bookData);
      postMessage({
        limited: b.getData(book._orderBookTableVisibleRowsCount),
        all: b.getData(500),
      });
    }
  }
);
