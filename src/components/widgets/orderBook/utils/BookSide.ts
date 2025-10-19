import { BookEntry } from "@/types/lib";

const sortDesc = (a: string, b: string): number => +b - +a;

export class BookSide {
  /**
   * 'Entries' keep track of the order book rows. Price is key, amount is value
   * Example: {
   *  '1.0': '5.0',
   *  '1.1': '5.0',
   * }
   */
  entries: Record<string, string> = {};

  /**
   * Sorted prices is used to keep track of prices of each entry in the descending order. It's synchronized with 'entries' always
   * It provides fast access when we want to access the 'highest' or 'lowest' entries
   * Example: ['1.1', '1.0', ...]
   */
  sortedPrices: string[] = [];

  /**
   * Handles WS snapshot
   */
  setSnapshot(events: BookEntry[]) {
    if (!events) {
      return;
    }
    for (let i = 0; i < events.length; i++) {
      const entry = events[i];
      if (!entry) {
        continue;
      }
      const price = entry[0];
      const amount = entry[1];

      this.entries[price] = amount;

      if (!this.sortedPrices.includes(price)) {
        this.sortedPrices.push(price);
      }
    }
    this.sortedPrices.sort(sortDesc);
  }

  update(events: BookEntry[]) {
    if (!events) {
      return;
    }

    for (let i = 0; i < events.length; i++) {
      const entry = events[i];
      if (!entry) {
        continue;
      }
      const price = entry[0];
      const amount = entry[1];

      if (amount === "0" || parseFloat(amount) === 0) {
        delete this.entries[price];
        this.sortedPrices = this.sortedPrices.filter(
          (sortedPrice) => sortedPrice !== price
        );
      } else {
        this.entries[price] = amount;
        if (!this.sortedPrices.includes(price)) {
          this.sortedPrices.push(price);
        }
      }
    }
    this.sortedPrices.sort(sortDesc);
  }

  /**
   *
   * @returns the entries. uses 'sortedPrices' since it's already sorted
   */
  take(): BookEntry[] {
    return this.sortedPrices.slice().map((price) => [
      price,
      String(this.entries[price]),
    ]);
  }

  /**
   *
   * @returns the entries in reversed order
   */
  takeReversed(): BookEntry[] {
    return this.sortedPrices
      .slice()
      .reverse()
      .map((price) => [price, String(this.entries[price])]);
  }

  /**
   *
   * @returns the first row with it's amount
   */
  getFirstRow(): BookEntry | null {
    if (this.sortedPrices.length === 0) {
      return null;
    }
    const firstPrice = this.sortedPrices[0];
    return [String(firstPrice), String(this.entries[String(firstPrice)])];
  }

  /**
   *
   * @returns the last row with it's amount
   */
  getLastRow(): BookEntry | null {
    if (this.sortedPrices.length === 0) {
      return null;
    }
    const lastPrice = this.sortedPrices[this.sortedPrices.length - 1];
    if (!lastPrice) {
      return null;
    }
    return [lastPrice, String(this.entries[lastPrice])];
  }

  isEmpty() {
    return this.sortedPrices.length === 0;
  }

  /**
   * Reset the internals
   */
  reset() {
    this.entries = {};
    this.sortedPrices = [];
  }
}
