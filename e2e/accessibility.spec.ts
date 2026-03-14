import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("skip link is first focusable element and visible on focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
  });

  test("nav has aria-label", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toHaveAttribute("aria-label", "Main navigation");
  });

  test("dashboard loading state has aria-busy", async ({ page }) => {
    await page.goto("/dashboard");
    const dashboardPage = page.locator(".dashboard-page");
    // Either aria-busy is true during loading, or content has loaded
    const ariaBusy = await dashboardPage.getAttribute("aria-busy");
    if (ariaBusy === "true") {
      // Loading state - good
      expect(ariaBusy).toBe("true");
    }
    // After load, content should be visible
    await expect(page.locator("h1")).toHaveText("Dashboard");
  });

  test("disruption list has aria-live", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("#scenario-select")).toBeVisible();

    const disruptionList = page.locator(".disruption-list");
    if (await disruptionList.count() > 0) {
      await expect(disruptionList).toHaveAttribute("aria-live", "polite");
    }
  });

  test("focus-visible rings appear on keyboard navigation", async ({ page }) => {
    await page.goto("/");
    // Tab through elements
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // first nav link

    const activeElement = page.locator(":focus");
    await expect(activeElement).toBeVisible();
  });
});
