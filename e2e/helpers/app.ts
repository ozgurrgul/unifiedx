import type { Page } from "@playwright/test";

export const BINANCE_BTC_EUR_PATH = "/binance/market/BTC-EUR";
export const BITVAVO_BTC_EUR_PATH = "/bitvavo/market/BTC-EUR";

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
