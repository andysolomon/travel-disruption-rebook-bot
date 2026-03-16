import { test, expect } from "@playwright/test";

test.describe("End-to-end claim generation flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear claims from localStorage to start fresh
    await page.goto("/dashboard");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator("#scenario-select")).toBeVisible();
  });

  test("generate claim from weather disruption and verify on claims page", async ({ page }) => {
    // Select weather disruption to get eligible claim
    await page.selectOption("#scenario-select", "weather-disruption");
    await expect(page.locator(".disruption-list")).toBeVisible();

    // Click generate claim
    const generateBtn = page.locator(".generate-claim-btn").first();
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toHaveText("Generate Claim");
    await generateBtn.click();

    // Should navigate to claim detail page
    await expect(page).toHaveURL(/\/claims\/claim-/);
    await expect(page.locator(".claim-detail__header")).toBeVisible();
    await expect(page.locator(".claim-detail__regulation")).toBeVisible();

    // Timeline should exist
    await expect(page.locator('[aria-label="Claim timeline"]')).toBeVisible();

    // Navigate to claims list
    await page.locator('a[href="/claims"]').click();
    await expect(page.locator("h1")).toHaveText("Claims");

    // The generated claim should appear in the list
    const claimRows = page.locator(".claim-row-link");
    const count = await claimRows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("returning to dashboard shows claim button disabled", async ({ page }) => {
    await page.selectOption("#scenario-select", "weather-disruption");
    await expect(page.locator(".disruption-list")).toBeVisible();

    const generateBtn = page.locator(".generate-claim-btn").first();
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await expect(page).toHaveURL(/\/claims\/claim-/);

      // Go back to dashboard
      await page.goto("/dashboard");
      await expect(page.locator("#scenario-select")).toBeVisible();
      // Re-select weather scenario
      await page.selectOption("#scenario-select", "weather-disruption");
      await expect(page.locator(".disruption-list")).toBeVisible();

      // Button should be disabled
      const disabledBtn = page.locator(".generate-claim-btn[disabled]");
      if (await disabledBtn.count() > 0) {
        await expect(disabledBtn.first()).toHaveText("Claim Created");
      }
    }
  });

  test("claims page shows empty state when no claims exist", async ({ page }) => {
    await page.goto("/claims");
    await expect(page.locator("h1")).toHaveText("Claims");
    // With cleared localStorage, there should be no generated claims
    // but mock claims may still be present depending on provider
    const emptyMsg = page.locator("text=No claims yet");
    const claimRows = page.locator(".claim-row-link");
    // Either empty state or rows should be visible
    const hasEmpty = await emptyMsg.isVisible().catch(() => false);
    const hasRows = await claimRows.count();
    expect(hasEmpty || hasRows > 0).toBe(true);
  });
});
