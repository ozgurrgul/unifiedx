import { expect, test } from "@playwright/test";
import { activateTab } from "./helpers/dock";

const PERP_DOCK_LAYOUT_STORAGE_KEY = "unifiedx-dock-layout-perp-v4";
import { waitForLiveTicker } from "./helpers/app";

const HELLO_TRADE_BTC_USDC_PATH = "/helloTrade/perp/market/BTC-USDC";

test.describe("Hello Trade perp", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HELLO_TRADE_BTC_USDC_PATH);
    await page.evaluate((key) => window.localStorage.removeItem(key), PERP_DOCK_LAYOUT_STORAGE_KEY);
    await page.reload();
    await page.getByTestId("exchange-dock").waitFor({ state: "visible" });
  });

  test("loads BTC-USDC market data", async ({ page }) => {
    await waitForLiveTicker(page);
    await expect(page.getByTestId("exchange-select")).toContainText(/hello trade/i);
    await expect(page.locator(".widget-subheader")).toContainText("BTC/USDC");

    await activateTab(page, "order-book");
    await expect(page.locator(".widget-order-book tbody tr").first()).toBeVisible({
      timeout: 30_000,
    });

    await activateTab(page, "trades");
    await expect
      .poll(async () => page.locator(".widget-trades tbody tr").count())
      .toBeGreaterThan(0);

    await expect(page.getByText("Funding", { exact: true })).toBeVisible();
  });

  test("switches market from the markets widget", async ({ page }) => {
    await waitForLiveTicker(page);
    await activateTab(page, "markets");

    const ethRow = page.locator(".widget-markets tbody tr", { hasText: /^ETH-/ }).first();
    await ethRow.waitFor({ state: "visible", timeout: 30_000 });
    await ethRow.click();

    await expect(page).toHaveURL(/\/helloTrade\/perp\/market\/ETH-/);
    await expect(page.locator(".widget-subheader")).toContainText("ETH/", { timeout: 30_000 });
    await expect
      .poll(async () => page.locator(".widget-trades tbody tr").count(), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });
});
