import { expect, test } from "@playwright/test";
import { activateTab } from "./helpers/dock";
import {
  BINANCE_BTC_EUR_PATH,
  BITVAVO_BTC_EUR_PATH,
  EXCHANGE_DEFAULT_MARKETS,
  gotoTradingMarket,
  waitForLiveTicker,
} from "./helpers/app";

test.describe("UnifiedX trading shell", () => {
  test("home page has no dock controls", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "UnifiedX", exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Select an exchange from the header to start trading")
    ).toBeVisible();
    await expect(page.getByTestId("reset-dock-layout")).toHaveCount(0);
    await expect(page.getByTestId("exchange-dock")).toHaveCount(0);
  });

  test("exchange root redirects to the default market", async ({ page }) => {
    await page.goto("/binance");
    await page.waitForURL(`**${BINANCE_BTC_EUR_PATH}`);
    await expect(page).toHaveURL(new RegExp(`${BINANCE_BTC_EUR_PATH}$`));
  });

  for (const { exchange, path, pairLabel } of EXCHANGE_DEFAULT_MARKETS) {
    test(`${exchange} loads default market with live ticker`, async ({ page }) => {
      await gotoTradingMarket(page, path);
      await expect(page.locator(".widget-subheader")).toContainText(pairLabel);
      await waitForLiveTicker(page);
      await activateTab(page, "order-book");
      await expect(page.locator(".widget-order-book")).toBeVisible();
    });
  }

  test("market page shows pair ticker and live last price", async ({ page }) => {
    await gotoTradingMarket(page);

    const subheader = page.locator(".widget-subheader");
    await expect(subheader).toContainText("BTC/EUR");
    await expect(subheader.getByText("Last Price")).toBeVisible();

    await waitForLiveTicker(page);
  });

  test("exchange pills navigate to each exchange default market", async ({
    page,
  }) => {
    await gotoTradingMarket(page);
    await waitForLiveTicker(page);

    await page.getByRole("button", { name: "bitvavo", exact: true }).click();
    await page.waitForURL(`**${BITVAVO_BTC_EUR_PATH}`);
    await expect(page.getByRole("button", { name: "bitvavo" })).toHaveClass(
      /exchange-pill-active/
    );

    await page.getByRole("button", { name: "binance", exact: true }).click();
    await page.waitForURL(`**${BINANCE_BTC_EUR_PATH}`);
  });

  test("credentials dialog opens from the header", async ({ page }) => {
    await gotoTradingMarket(page);

    await page.getByRole("button", { name: "Credentials" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByText("Set or update your credentials for binance")
    ).toBeVisible();
  });

  test("core dock widgets render market data", async ({ page }) => {
    await gotoTradingMarket(page);
    await waitForLiveTicker(page);

    await activateTab(page, "order-book");
    await expect(page.locator(".widget-order-book")).toBeVisible();

    await activateTab(page, "markets");
    await expect(page.locator(".widget-markets")).toBeVisible();
    await expect(page.getByPlaceholder("Search markets...")).toBeVisible();

    await activateTab(page, "trades");
    await expect(page.locator(".widget-trades")).toBeVisible();
  });

  test("markets list navigates to another pair", async ({ page }) => {
    await gotoTradingMarket(page);
    await waitForLiveTicker(page);

    await activateTab(page, "markets");
    const search = page.getByPlaceholder("Search markets...");
    await search.fill("ETH");
    await page
      .locator(".widget-markets")
      .getByRole("row")
      .filter({ hasText: "ETH-EUR" })
      .first()
      .click();

    await page.waitForURL("**/binance/market/ETH-EUR");
    await expect(page.locator(".widget-subheader").getByText("ETH")).toBeVisible();
  });
});
