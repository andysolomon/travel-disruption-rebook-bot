import { test, expect } from "@playwright/test";

test.describe("Claim detail page", () => {
  test("shows claim header with flight number, regulation, status, and payout", async ({ page }) => {
    await page.goto("/claims/claim-1");
    const header = page.locator(".claim-detail__header");
    await expect(header.locator("h1")).toHaveText("LH903");
    await expect(header.locator(".claim-detail__regulation")).toHaveText("EU261");
    await expect(header.locator(".status-pill")).toBeVisible();
    await expect(header.locator(".confidence-band")).toBeVisible();
    await expect(header.locator(".confidence-band__amount")).toContainText("EUR");
    await expect(header.locator(".confidence-band__label")).toContainText("confidence");
  });

  test("shows timeline entries with labels and dates", async ({ page }) => {
    await page.goto("/claims/claim-1");
    const timeline = page.locator('[aria-label="Claim timeline"]');
    await expect(timeline).toBeVisible();
    const items = timeline.locator('[role="listitem"]');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("Disruption detected");
    await expect(items.nth(1)).toContainText("Eligibility confirmed");
    // Dates are formatted
    await expect(items.first().locator(".claim-timeline__date")).toBeVisible();
  });

  test("shows document checklist with provided and missing items", async ({ page }) => {
    await page.goto("/claims/claim-1");
    const checklist = page.locator('[aria-label="Document checklist"]');
    await expect(checklist).toBeVisible();
    const items = checklist.locator("li");
    await expect(items).toHaveCount(3);

    // First item is provided (Booking confirmation)
    await expect(items.nth(0)).toContainText("Booking confirmation");
    await expect(items.nth(0).locator(".doc-checklist__icon")).toHaveText("✓");

    // Remaining items are not provided and marked Required
    await expect(items.nth(1)).toContainText("Cancellation notice");
    await expect(items.nth(1).locator(".doc-checklist__icon")).toHaveText("○");
    await expect(items.nth(1).locator(".doc-checklist__badge")).toHaveText("Required");
  });

  test("claim-2 shows more timeline entries than claim-1", async ({ page }) => {
    await page.goto("/claims/claim-2");
    await expect(page.locator("h1")).toHaveText("BA357");
    const items = page.locator('[aria-label="Claim timeline"] [role="listitem"]');
    await expect(items).toHaveCount(4);
    await expect(items.nth(3)).toContainText("Claim ready to file");
  });

  test("nonexistent claim shows not found", async ({ page }) => {
    await page.goto("/claims/does-not-exist");
    await expect(page.locator("text=Claim not found")).toBeVisible();
  });
});
