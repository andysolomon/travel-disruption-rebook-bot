import { test, expect } from "@playwright/test";

test.describe("Settings — form interaction and persistence", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto("/settings");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator("h1")).toHaveText("Settings");
  });

  test("displays email and loyalty program info", async ({ page }) => {
    await expect(page.locator("text=Email")).toBeVisible();
    // Loyalty programs section
    await expect(page.locator("text=Loyalty Programs")).toBeVisible();
    await expect(page.locator("text=Star Alliance")).toBeVisible();
  });

  test("changing seat preference persists across reload", async ({ page }) => {
    await page.selectOption("#seat-pref", "aisle");
    await expect(page.locator("#seat-pref")).toHaveValue("aisle");

    await page.reload();
    await expect(page.locator("h1")).toHaveText("Settings");
    await expect(page.locator("#seat-pref")).toHaveValue("aisle");
  });

  test("changing cabin class persists across reload", async ({ page }) => {
    await page.selectOption("#cabin-class", "business");
    await expect(page.locator("#cabin-class")).toHaveValue("business");

    await page.reload();
    await expect(page.locator("h1")).toHaveText("Settings");
    await expect(page.locator("#cabin-class")).toHaveValue("business");
  });

  test("changing max layover persists across reload", async ({ page }) => {
    await page.fill("#max-layover", "90");
    await expect(page.locator("#max-layover")).toHaveValue("90");

    await page.reload();
    await expect(page.locator("h1")).toHaveText("Settings");
    await expect(page.locator("#max-layover")).toHaveValue("90");
  });

  test("changing preferred airlines persists across reload", async ({ page }) => {
    await page.fill("#preferred-airlines", "BA, LH");
    await expect(page.locator("#preferred-airlines")).toHaveValue("BA, LH");

    await page.reload();
    await expect(page.locator("h1")).toHaveText("Settings");
    await expect(page.locator("#preferred-airlines")).toHaveValue("BA, LH");
  });
});
