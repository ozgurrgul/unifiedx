import type { Locator, Page } from "@playwright/test";

export const MARKET_PATH = "/binance/market/BTC-EUR";

export const DOCK_LAYOUT_STORAGE_KEY = "unifiedx-dock-layout-v2";

export const PANEL_IDS = [
  "order-book",
  "chart",
  "depth-chart",
  "markets",
  "trades",
  "market-order",
  "limit-order",
  "balances",
  "base-open-orders",
  "all-open-orders",
  "order-history",
] as const;

export type PanelId = (typeof PANEL_IDS)[number];

export function dockTab(page: Page, panelId: PanelId): Locator {
  return page
    .locator(".dv-tab")
    .filter({ has: page.getByTestId(`dock-tab-${panelId}`) });
}

export function dockPanel(page: Page, panelId: PanelId): Locator {
  return page.getByTestId(`dock-panel-${panelId}`);
}

export async function waitForDockReady(
  page: Page,
  options?: { freshLayout?: boolean }
): Promise<void> {
  const freshLayout = options?.freshLayout ?? true;

  if (freshLayout) {
    await page.goto(MARKET_PATH);
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, DOCK_LAYOUT_STORAGE_KEY);
    await page.reload();
  } else {
    await page.goto(MARKET_PATH);
  }

  await page.getByTestId("exchange-dock").waitFor({ state: "visible" });
  for (const id of PANEL_IDS) {
    await dockTab(page, id).waitFor({ state: "visible" });
  }
}

export async function tabStripFor(page: Page, panelId: PanelId): Promise<Locator> {
  const tab = dockTab(page, panelId);
  return tab.locator("xpath=ancestor::*[contains(@class,'dv-tabs-container')][1]");
}

export async function dragTabOntoTab(
  page: Page,
  sourceId: PanelId,
  targetId: PanelId
): Promise<void> {
  const source = dockTab(page, sourceId);
  const target = dockTab(page, targetId);
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
  await source.dragTo(target, { force: true });
}

export async function tabsShareGroup(
  page: Page,
  a: PanelId,
  b: PanelId
): Promise<boolean> {
  const stripA = await tabStripFor(page, a);
  const stripB = await tabStripFor(page, b);
  const handleA = await stripA.elementHandle();
  const handleB = await stripB.elementHandle();
  if (!handleA || !handleB) {
    return false;
  }
  return page.evaluate(
    ([elA, elB]) => elA === elB,
    [handleA, handleB] as const
  );
}

export async function activateTab(page: Page, panelId: PanelId): Promise<void> {
  await dockTab(page, panelId).click();
}

export async function resizeDockWithSplitter(page: Page): Promise<void> {
  const layoutBefore = await readLayoutSnapshot(page);
  if (!layoutBefore) {
    throw new Error("Layout snapshot missing before resize");
  }

  const sashes = page.locator(
    '[data-testid="exchange-dock"] .dv-sash:not(.dv-disabled)'
  );
  const count = await sashes.count();
  if (count === 0) {
    throw new Error("No enabled splitters found");
  }

  for (let i = 0; i < count; i++) {
    for (const [deltaX, deltaY] of [
      [-140, 0],
      [140, 0],
      [0, -100],
      [0, 100],
    ] as const) {
      const sash = sashes.nth(i);
      await sash.scrollIntoViewIfNeeded();
      const box = await sash.boundingBox();
      if (!box) {
        continue;
      }
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 24 });
      await page.mouse.up();
      await page.waitForTimeout(450);

      const layoutAfter = await readLayoutSnapshot(page);
      if (layoutAfter && layoutAfter !== layoutBefore) {
        return;
      }
    }
  }

  throw new Error("Splitter drag did not change persisted layout");
}

export async function readLayoutSnapshot(page: Page): Promise<string | null> {
  return page.evaluate((key) => window.localStorage.getItem(key), DOCK_LAYOUT_STORAGE_KEY);
}
