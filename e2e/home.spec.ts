import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays hero section with heading and CTA", async ({ page }) => {
    await expect(page.locator(".kicker")).toHaveText("Travel Disruption Rebook Bot");
    await expect(page.locator("h1")).toContainText("Recover Time and Compensation");
    await expect(page.locator(".lede")).toBeVisible();
    const cta = page.locator(".cta-link");
    await expect(cta).toHaveText("Go to Dashboard →");
    await expect(cta).toHaveAttribute("href", "/dashboard");
  });

  test("displays all three product pillars", async ({ page }) => {
    const pillars = page.locator('[aria-label="Core product pillars"] article');
    await expect(pillars).toHaveCount(3);
    await expect(pillars.nth(0).locator("h2")).toHaveText("Real-Time Disruption Monitoring");
    await expect(pillars.nth(1).locator("h2")).toHaveText("Rebooking Decision Support");
    await expect(pillars.nth(2).locator("h2")).toHaveText("Compensation Recovery Workflow");
  });

  test("displays implementation phases", async ({ page }) => {
    await expect(page.locator('[aria-label="Delivery phases"] h2')).toHaveText("Implementation Track");
    const phases = page.locator('[aria-label="Delivery phases"] ol li');
    await expect(phases).toHaveCount(5);
    await expect(phases.nth(0)).toContainText("Foundation");
    await expect(phases.nth(4)).toContainText("Polish");
  });

  test("CTA navigates to dashboard", async ({ page }) => {
    await page.locator(".cta-link").click();
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toHaveText("Dashboard");
  });
});
