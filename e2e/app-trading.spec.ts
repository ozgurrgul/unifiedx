import { expect, test } from "@playwright/test";
import { activateTab, tabsShareGroup } from "./helpers/dock";
import {
  BINANCE_BTC_EUR_PATH,
  BINANCE_BTC_USDT_PERP_PATH,
  BITVAVO_BTC_EUR_PATH,
  EXCHANGE_FIXTURES,
  gotoPerpTradingMarket,
  gotoTradingMarket,
  selectExchange,
  selectProduct,
  waitForLiveTicker,
} from "./helpers/app";
import {
  assertExchangeRootRedirect,
  assertExchangeTradingBasics,
} from "./helpers/exchangeBasics";

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

  test("exchange dropdown navigates to each exchange default market", async ({
    page,
  }) => {
    await gotoTradingMarket(page);
    await waitForLiveTicker(page);

    await selectExchange(page, "bitvavo");
    await page.waitForURL(`**${BITVAVO_BTC_EUR_PATH}`);

    await selectExchange(page, "binance");
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

    await page.waitForURL("**/binance/spot/market/ETH-EUR");
    await expect(page.locator(".widget-subheader").getByText("ETH")).toBeVisible();
  });
});

test.describe("Binance perp", () => {
  test("default perp route loads live market data", async ({ page }) => {
    await gotoPerpTradingMarket(page);
    await waitForLiveTicker(page);
    await expect(page).toHaveURL(new RegExp(`${BINANCE_BTC_USDT_PERP_PATH}$`));
    await expect(page.getByTestId("product-select")).toHaveText(/perp/i);
    await expect(page.getByText("Mark", { exact: true })).toBeVisible();
    await expect(page.getByText("Funding", { exact: true })).toBeVisible();
  });

  test("product dropdown switches between spot and perp", async ({ page }) => {
    await gotoTradingMarket(page);
    await waitForLiveTicker(page);

    await selectProduct(page, "perp");
    await page.waitForURL("**/binance/perp/market/BTC-USDT");
    await waitForLiveTicker(page);

    await selectProduct(page, "spot");
    await page.waitForURL("**/binance/spot/market/BTC-USDT");
    await waitForLiveTicker(page);
  });

  test("markets and trades tabs are grouped with markets open by default", async ({
    page,
  }) => {
    await gotoPerpTradingMarket(page);
    await waitForLiveTicker(page);

    await expect.poll(async () => tabsShareGroup(page, "markets", "trades")).toBe(true);
    await expect(page.getByPlaceholder("Search markets...")).toBeVisible();
  });

  test("perp markets list is populated", async ({ page }) => {
    await gotoPerpTradingMarket(page);
    await waitForLiveTicker(page);

    await activateTab(page, "markets");
    await expect(page.getByPlaceholder("Search markets...")).toBeVisible();
    await expect
      .poll(async () => page.locator(".widget-markets tbody tr").count())
      .toBeGreaterThan(5);
    await expect(page.locator(".widget-markets")).toContainText("BTC-USDT");
  });

  test("perp market row navigates to another pair", async ({ page }) => {
    await gotoPerpTradingMarket(page);
    await waitForLiveTicker(page);

    await activateTab(page, "markets");
    await page.getByPlaceholder("Search markets...").fill("ETH");
    await page
      .locator(".widget-markets")
      .getByRole("row")
      .filter({ hasText: "ETH-USDT" })
      .first()
      .click();

    await page.waitForURL("**/binance/perp/market/ETH-USDT");
    await expect(page.locator(".widget-subheader").getByText("ETH")).toBeVisible();
  });
});

test.describe("Exchange trading basics", () => {
  for (const fixture of EXCHANGE_FIXTURES) {
    test(`${fixture.exchange} default route redirects to the trading market`, async ({
      page,
    }) => {
      await assertExchangeRootRedirect(page, fixture);
    });

    test(`${fixture.exchange} order book, markets, trades, and charts work`, async ({
      page,
    }) => {
      await assertExchangeTradingBasics(page, fixture);
    });
  }
});
