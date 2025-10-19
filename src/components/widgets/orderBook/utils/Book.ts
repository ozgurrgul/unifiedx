import { BookSide } from "./BookSide";
import { StatCalculator } from "./StatCalculator";
import { ComputedOrderBookData, ShapedBookEntry } from "../types";
import { BookData, BookEntry } from "@/types/lib";

export const UPDATE_INTERVAL_MS = 200;

export class Book {
  // Current grouping selected by user
  _digitsFromPricePrecision = 0;

  _orderBookTableVisibleRowsCount = 10;

  // Asks and bids holder
  _askBookSide = new BookSide();
  _bidBookSide = new BookSide();

  // Stats and depth calculators, runs every 'UPDATE_INTERVAL_MS'
  _statsCalculator = new StatCalculator();

  // Delta WS events are kept in queue and processed every 'UPDATE_INTERVAL_MS'
  _lastSequence = 0;

  _updateIntervalId: any;

  _market: string = "";

  setSnapshot(event?: BookData) {
    if (!event) {
      return this;
    }
    const { asks, bids } = event;
    this.getAskSide().setSnapshot(asks);
    this.getBidSide().setSnapshot(bids);
    this._market = event.market.market;
    return this;
  }

  update(event?: BookData) {
    if (!event) {
      return this;
    }
    const { asks, bids } = event;
    this.getAskSide().update(asks);
    this.getBidSide().update(bids);
    this._market = event.market.market;
    return this;
  }

  setOrderBookTableVisibleRowsCount(n = 10) {
    this._orderBookTableVisibleRowsCount = n;
    return this;
  }

  /**
   * This is the main function iterates over events in '_deltaEventQueue'
   * Runs every 'UPDATE_INTERVAL_MS' and emits the data using updateCallback
   */
  getData(limit: number, quoteAssetPrecision: number): ComputedOrderBookData {
    // Asks and bids to be consumed by order book
    const asksReversed = this.getAskSide().takeReversed();
    const bids = this.getBidSide().take();
    const asksLastRow = this.getAskSide().getLastRow();
    const bidsFirstRow = this.getBidSide().getFirstRow();

    // Mid market price and spread is calculated, can be used in the depth calculator
    const { midMarketPrice, spreadPercentage } =
      this.getStatCalculator().update(
        asksLastRow,
        bidsFirstRow,
        quoteAssetPrecision
      );

    // If the grouping is changed from order book component, we should apply aggregation to asks/bids
    // const needsAggregation = this.getDigitsFromPricePrecision() !== 0;

    // Orderbook asks/bids
    const orderBookAsks = asksReversed;
    const orderBookBids = bids;

    // if (needsAggregation) {
    //   orderBookAsks = this.applyAggregation(orderBookAsks);
    //   orderBookBids = this.applyAggregation(orderBookBids);
    // }

    const newAsks = this.sliceEntries(orderBookAsks, limit);
    const newBids = this.sliceEntries(orderBookBids, limit);

    const asksComputed = this.returnEmptiesIfEmpty(
      this.shapeEntry(newAsks.slice().reverse())
    );

    const bidsComputed = this.returnEmptiesIfEmpty(this.shapeEntry(newBids));
    const sumOfAsksTotal = asksComputed.reduce((sum, obj) => sum + obj.t, 0);
    const sumOfBidsTotal = bidsComputed.reduce((sum, obj) => sum + obj.t, 0);

    return {
      asks: asksComputed,
      bids: bidsComputed,
      spreadPercentage,
      midMarketPrice,
      sumOfAsksTotal,
      sumOfBidsTotal,
      market: this._market,
    };
  }

  shapeEntry(entries: BookEntry[]): ShapedBookEntry[] {
    return entries.map((e, i) => ({
      a: e[1],
      p: e[0],
      t: parseFloat(e[0]) * parseFloat(e[1]),
      k: i.toString(),
    }));
  }

  returnEmptiesIfEmpty(entries: ShapedBookEntry[]): ShapedBookEntry[] {
    if (entries.length === 0) {
      return new Array(this._orderBookTableVisibleRowsCount).fill({
        a: "0",
        p: "0",
        t: 0,
      });
    }
    return entries;
  }

  /**
     * Applies aggregation to the bids/asks
     * Example:
     Input
      entries = [
        ["1.3", "5.000"],
        ["2.4", "5.000"],
      ]
      digitsFromPricePrecision = 0
      pricePrecision = 2
    Output
      expected = [
        ["1.30", "5.000"],
        ["2.40", "5.000"],
      ];
     */

  // Slice entries based on the requested amount by OrderBook component
  // .slice() is an expensive call, so doing it in here web worker
  sliceEntries(entries: BookEntry[], limit: number): BookEntry[] {
    return entries.slice(0, limit);
  }

  getAskSide() {
    return this._askBookSide;
  }

  getBidSide() {
    return this._bidBookSide;
  }

  getStatCalculator() {
    return this._statsCalculator;
  }

  reset() {
    this._lastSequence = 0;
    this._digitsFromPricePrecision = 0;
    this.getAskSide().reset();
    this.getBidSide().reset();
    return this;
  }
}
