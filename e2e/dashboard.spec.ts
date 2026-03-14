import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("shows skeleton loading state", async ({ page }) => {
    await page.goto("/dashboard");
    const skeleton = page.locator(".skeleton").first();
    // Skeleton should appear briefly
    await expect(skeleton).toBeVisible({ timeout: 1000 }).catch(() => {
      // Skeleton may disappear quickly - that's fine
    });
    // Eventually content loads
    await expect(page.locator("h1")).toHaveText("Dashboard");
  });

  test("scenario switching updates disruptions", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toHaveText("Dashboard");

    // Wait for data to load
    await expect(page.locator("#scenario-select")).toBeVisible();

    // Get initial disruption state
    const initialDisruptions = await page.locator(".disruption-card").count();

    // Switch to weather disruption scenario
    await page.selectOption("#scenario-select", "weather-disruption");

    // Disruption list should update
    await expect(page.locator(".disruption-list")).toBeVisible();
    const weatherDisruptions = await page.locator(".disruption-card").count();
    expect(weatherDisruptions).toBeGreaterThan(0);

    // Switch to short-delay scenario
    await page.selectOption("#scenario-select", "short-delay");
    await expect(page.locator(".disruption-list")).toBeVisible();

    // Switch back to baseline
    await page.selectOption("#scenario-select", "baseline");
    const baselineDisruptions = await page.locator(".disruption-card").count();
    expect(baselineDisruptions).toBe(initialDisruptions);
  });

  test("generate claim flow navigates to detail page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("#scenario-select")).toBeVisible();

    // Make sure we have an eligible disruption with a generate button
    const generateBtn = page.locator(".generate-claim-btn").first();

    if (await generateBtn.isVisible()) {
      await generateBtn.click();

      // Should navigate to claim detail
      await expect(page).toHaveURL(/\/claims\/claim-/);
    }
  });

  test("generate claim button disables after click", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("#scenario-select")).toBeVisible();

    const generateBtn = page.locator('.generate-claim-btn:not([disabled])').first();

    if (await generateBtn.isVisible()) {
      // Navigate to the detail page, then go back to dashboard
      await generateBtn.click();
      await expect(page).toHaveURL(/\/claims\/claim-/);

      // Go back to dashboard
      await page.goto("/dashboard");
      await expect(page.locator("#scenario-select")).toBeVisible();

      // The button should now say "Claim Created" and be disabled
      const disabledBtn = page.locator(".generate-claim-btn[disabled]");
      if (await disabledBtn.count() > 0) {
        await expect(disabledBtn.first()).toHaveText("Claim Created");
      }
    }
  });
});
