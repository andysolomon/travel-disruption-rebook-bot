import { test, expect } from "@playwright/test";

test.describe("Claims", () => {
  test("claims list shows mock claims", async ({ page }) => {
    await page.goto("/claims");
    await expect(page.locator("h1")).toHaveText("Claims");
    const claimRows = page.locator(".claim-row-link");
    await expect(claimRows.first()).toBeVisible();
    const count = await claimRows.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("clicking claim row navigates to detail page", async ({ page }) => {
    await page.goto("/claims");
    const firstRow = page.locator(".claim-row-link").first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();
    await expect(page).toHaveURL(/\/claims\/claim-/);
  });

  test("claim detail page shows timeline and document checklist", async ({ page }) => {
    await page.goto("/claims/claim-1");
    await expect(page.locator("h1")).toHaveText("LH903");

    // Timeline section
    await expect(page.locator("text=Timeline")).toBeVisible();

    // Documents section
    await expect(page.locator("text=Documents")).toBeVisible();
  });

  test("nonexistent claim shows not found", async ({ page }) => {
    await page.goto("/claims/claim-nonexistent");
    await expect(page.locator("text=Claim not found")).toBeVisible();
  });
});
