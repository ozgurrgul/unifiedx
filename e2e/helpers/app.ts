import type { Page } from "@playwright/test";

export const BINANCE_BTC_EUR_PATH = "/binance/market/BTC-EUR";
export const BITVAVO_BTC_EUR_PATH = "/bitvavo/market/BTC-EUR";
export const BTC_TURK_BTC_TRY_PATH = "/btcTurk/market/BTC-TRY";
export const KRAKEN_BTC_EUR_PATH = "/kraken/market/BTC-EUR";

export type ExchangeFixture = {
  exchange: string;
  rootPath: string;
  path: string;
  pairLabel: string;
};

export const EXCHANGE_FIXTURES: ExchangeFixture[] = [
  {
    exchange: "binance",
    rootPath: "/binance",
    path: BINANCE_BTC_EUR_PATH,
    pairLabel: "BTC/EUR",
  },
  {
    exchange: "bitvavo",
    rootPath: "/bitvavo",
    path: BITVAVO_BTC_EUR_PATH,
    pairLabel: "BTC/EUR",
  },
  {
    exchange: "btcTurk",
    rootPath: "/btcTurk",
    path: BTC_TURK_BTC_TRY_PATH,
    pairLabel: "BTC/TRY",
  },
  {
    exchange: "kraken",
    rootPath: "/kraken",
    path: KRAKEN_BTC_EUR_PATH,
    pairLabel: "BTC/EUR",
  },
];

export async function gotoTradingMarket(
  page: Page,
  path = BINANCE_BTC_EUR_PATH
): Promise<void> {
  await page.goto(path);
  await page.getByTestId("exchange-dock").waitFor({ state: "visible" });
  await page.locator(".widget-subheader").waitFor({ state: "visible" });
}

export async function waitForLiveTicker(page: Page): Promise<void> {
  const lastPrice = page.locator(".widget-subheader").getByText("Last Price");
  await lastPrice.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const subheader = document.querySelector(".widget-subheader");
    if (!subheader) {
      return false;
    }
    const value = subheader.querySelector(".ticker-value");
    const text = value?.textContent?.trim() ?? "";
    return /\d/.test(text) && !text.includes("—");
  });
}
