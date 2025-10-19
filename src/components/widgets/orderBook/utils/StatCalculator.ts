import { BookEntry } from "@/types/lib";

const NA = "N.A.";

/**
 * Calculates the mid market price and spread percentage
 */
export class StatCalculator {
  /**
   * Main function to calculate the stats data for orderbook
   * @param lowestAsk lowest priced ask entry
   * @param highestBid highest priced bid entry
   * @param quoteAssetPrecision quote precision from market settings
   * @returns spread percentage and mid market price
   * Example:
   Input
      lowestAsk = ["1.2", "5.0"];
      highestBid = ["1.0", "5.0"];
      quoteAssetPrecision = 1;
    Output
      expectedMidMarketPrice = 1.1
      expectedSpreadPercentage = 18.18%"
   */
  update(
    lowestAsk: BookEntry | null,
    highestBid: BookEntry | null,
    quoteAssetPrecision: number | undefined
  ) {
    const lowestAskPrice = parseFloat(lowestAsk ? lowestAsk[0] : "0");
    const highestBidPrice = parseFloat(highestBid ? highestBid[0] : "0");
    let midMarketPrice = 0;
    let spreadPercentage = NA;

    // If we have only lowestAsk, that's the mid market price
    if (lowestAsk && !highestBid) {
      midMarketPrice = +lowestAskPrice.toFixed(quoteAssetPrecision);
    }
    // If we have only highestBid, that's the mid market price
    else if (!lowestAsk && highestBid) {
      midMarketPrice = +highestBidPrice.toFixed(quoteAssetPrecision);
    }
    // If we have both lowestAsk and highestBid, then we can use them together
    else if (lowestAsk && highestBid) {
      midMarketPrice = +((highestBidPrice + lowestAskPrice) * 0.5).toFixed(
        quoteAssetPrecision
      );
    }

    // If one of the ask/bid prices are 0, that means spread is N/A
    if (lowestAskPrice === 0 || highestBidPrice === 0) {
      spreadPercentage = NA;
    }
    // Otherwise we can successfully calculate the spread percentage
    else {
      const spread = +Math.max(lowestAskPrice - highestBidPrice, 0);
      const percentage = ((spread / midMarketPrice) * 100).toFixed(3);
      spreadPercentage = `${percentage}%`;
    }

    return {
      spreadPercentage,
      midMarketPrice,
    };
  }
}
