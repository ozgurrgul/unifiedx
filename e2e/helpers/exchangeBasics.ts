import { expect, type Page } from "@playwright/test";
import { type ExchangeFixture, gotoTradingMarket, waitForLiveTicker } from "./app";
import { activateTab, dockPanel } from "./dock";

/** Core market-data widgets every exchange should expose on the default pair. */
export async function assertExchangeTradingBasics(
  page: Page,
  fixture: ExchangeFixture
): Promise<void> {
  await gotoTradingMarket(page, fixture.path);

  const subheader = page.locator(".widget-subheader");
  await expect(subheader).toContainText(fixture.pairLabel);
  await expect(subheader.getByText("Last Price")).toBeVisible();
  await waitForLiveTicker(page);

  await activateTab(page, "order-book");
  await expect(page.locator(".widget-order-book")).toBeVisible();
  await expect(page.locator(".widget-order-book tbody tr").first()).toBeVisible({
    timeout: 20_000,
  });

  await activateTab(page, "markets");
  await expect(page.locator(".widget-markets")).toBeVisible();
  await expect(page.getByPlaceholder("Search markets...")).toBeVisible();
  await expect
    .poll(async () => page.locator(".widget-markets tbody tr").count())
    .toBeGreaterThan(0);

  await activateTab(page, "trades");
  await expect(page.locator(".widget-trades")).toBeVisible();
  await expect
    .poll(async () => page.locator(".widget-trades tbody tr").count())
    .toBeGreaterThan(0);

  await activateTab(page, "chart");
  await expect(dockPanel(page, "chart")).toBeVisible();

  await activateTab(page, "market-order");
  await expect(page.locator(".widget-market-order")).toBeVisible();

  await activateTab(page, "depth-chart");
  await expect(dockPanel(page, "depth-chart")).toBeVisible();
}

export async function assertExchangeRootRedirect(
  page: Page,
  fixture: ExchangeFixture
): Promise<void> {
  await page.goto(fixture.rootPath);
  await page.waitForURL(`**${fixture.path}`);
  await expect(page).toHaveURL(new RegExp(`${fixture.path.replace("/", "\\/")}$`));
}
