import { expect, test } from "@playwright/test";
import { activateTab } from "./helpers/dock";
import {
  BINANCE_BTC_EUR_PATH,
  BITVAVO_BTC_EUR_PATH,
  EXCHANGE_FIXTURES,
  gotoTradingMarket,
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
