import { expect, test } from "@playwright/test";
import {
  activateTab,
  dockPanel,
  dockTab,
  dragTabOntoTab,
  PANEL_IDS,
  readLayoutSnapshot,
  resizeDockWithSplitter,
  tabsShareGroup,
  waitForDockReady,
} from "./helpers/dock";

test.describe("Exchange dockview layout", () => {
  test("loads default layout with all trading panels", async ({ page }) => {
    await waitForDockReady(page);

    for (const id of PANEL_IDS) {
      await expect(dockTab(page, id)).toBeVisible();
      await activateTab(page, id);
      await expect(dockPanel(page, id)).toBeVisible();
    }

    await expect(page.getByTestId("dock-tab-base-open-orders")).toContainText(
      "BTC open orders"
    );
    await expect(page.getByTestId("dock-tab-all-open-orders")).toHaveText(
      "All open orders"
    );
    await expect(page.getByTestId("dock-tab-order-history")).toContainText(
      "BTC order history"
    );

    await expect(page.getByTestId("reset-dock-layout")).toBeVisible();
  });

  test("pre-built tab groups include chart/depth and order panels", async ({
    page,
  }) => {
    await waitForDockReady(page);

    await expect
      .poll(async () => tabsShareGroup(page, "chart", "depth-chart"))
      .toBe(true);
    await expect
      .poll(async () => tabsShareGroup(page, "market-order", "limit-order"))
      .toBe(true);
    await expect
      .poll(async () => tabsShareGroup(page, "base-open-orders", "all-open-orders"))
      .toBe(true);
  });

  test("merges panels into a tab group via drag and drop", async ({ page }) => {
    await waitForDockReady(page);

    expect(await tabsShareGroup(page, "order-book", "trades")).toBe(false);

    await dragTabOntoTab(page, "order-book", "trades");

    await expect
      .poll(async () => tabsShareGroup(page, "order-book", "trades"))
      .toBe(true);

    await activateTab(page, "trades");
    await expect(dockPanel(page, "trades")).toBeVisible();

    await activateTab(page, "order-book");
    await expect(dockPanel(page, "order-book")).toBeVisible();
  });

  test("switches between the three order dock tabs", async ({ page }) => {
    await waitForDockReady(page);

    await expect
      .poll(async () => tabsShareGroup(page, "base-open-orders", "all-open-orders"))
      .toBe(true);
    await expect
      .poll(async () => tabsShareGroup(page, "base-open-orders", "order-history"))
      .toBe(true);

    for (const id of [
      "base-open-orders",
      "all-open-orders",
      "order-history",
    ] as const) {
      await activateTab(page, id);
      await expect(dockPanel(page, id)).toBeVisible();
    }
  });

  test("resizes split panes with the splitter", async ({ page }) => {
    await waitForDockReady(page);

    await resizeDockWithSplitter(page);

    await expect.poll(async () => readLayoutSnapshot(page)).toBeTruthy();
  });

  test("persists layout across reload", async ({ page }) => {
    await waitForDockReady(page);

    await dragTabOntoTab(page, "markets", "trades");
    await expect.poll(async () => tabsShareGroup(page, "markets", "trades")).toBe(true);

    await expect.poll(async () => readLayoutSnapshot(page)).not.toBeNull();

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByTestId("exchange-dock").waitFor({ state: "visible" });
    await dockTab(page, "markets").waitFor({ state: "visible" });

    await expect.poll(async () => tabsShareGroup(page, "markets", "trades")).toBe(true);
  });

  test("reset layout restores separated panels after complex edits", async ({
    page,
  }) => {
    await waitForDockReady(page);

    await dragTabOntoTab(page, "order-book", "trades");
    await dragTabOntoTab(page, "balances", "markets");
    await resizeDockWithSplitter(page);

    await expect
      .poll(async () => tabsShareGroup(page, "order-book", "trades"))
      .toBe(true);

    await page.getByTestId("reset-dock-layout").click();

    await expect
      .poll(async () => tabsShareGroup(page, "order-book", "trades"))
      .toBe(false);
    await expect
      .poll(async () => tabsShareGroup(page, "balances", "markets"))
      .toBe(false);
    await expect
      .poll(async () => tabsShareGroup(page, "chart", "depth-chart"))
      .toBe(true);

    for (const id of PANEL_IDS) {
      await expect(dockTab(page, id)).toBeVisible();
    }

    const saved = await readLayoutSnapshot(page);
    expect(saved).toBeTruthy();
  });
});
