import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("skip link is first focusable element and visible on focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveText("Skip to main content");
  });

  test("skip link navigates to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    const main = page.locator("#main-content");
    await expect(main).toBeVisible();
  });

  test("Home link navigates to home page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a:has-text("Home")');
    await expect(page).toHaveURL("/");
  });

  test("Dashboard link navigates correctly", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Dashboard")');
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toHaveText("Dashboard");
  });

  test("Claims link navigates correctly", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Claims")');
    await expect(page).toHaveURL("/claims");
    await expect(page.locator("h1")).toHaveText("Claims");
  });

  test("Settings link navigates correctly", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Settings")');
    await expect(page).toHaveURL("/settings");
    await expect(page.locator("h1")).toHaveText("Settings");
  });

  test("all routes are reachable directly", async ({ page }) => {
    for (const path of ["/", "/dashboard", "/claims", "/settings"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
