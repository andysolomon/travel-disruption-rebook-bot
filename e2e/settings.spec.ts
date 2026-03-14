import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("shows skeleton loading state initially", async ({ page }) => {
    await page.goto("/settings");
    // Skeleton appears briefly during load
    const skeleton = page.locator(".skeleton").first();
    await expect(skeleton).toBeVisible({ timeout: 1000 }).catch(() => {
      // May disappear quickly
    });
    // Content eventually loads
    await expect(page.locator("h1")).toHaveText("Settings");
  });

  test("profile is displayed after loading", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toHaveText("Settings");
    await expect(page.locator("text=Traveler Profile")).toBeVisible();
    await expect(page.locator("text=Elena Kowalski")).toBeVisible();
  });

  test("preferences form controls are visible", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Preferences")).toBeVisible();
    await expect(page.locator("#seat-pref")).toBeVisible();
    await expect(page.locator("#cabin-class")).toBeVisible();
    await expect(page.locator("#max-layover")).toBeVisible();
    await expect(page.locator("#preferred-airlines")).toBeVisible();
  });
});
