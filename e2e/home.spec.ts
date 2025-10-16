import { test, expect } from "@playwright/test";

test.describe("Landing smoke", () => {
  test("CTA navegar a /register", async ({ page }) => {
    await page.goto("/");
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    // Find the link by href attribute instead of text content
    const link = page.locator('a[href="/register"]').first();
    await expect(link).toBeVisible({ timeout: 10000 });
    await expect(link).toHaveAttribute("href", "/register");
  });
});


