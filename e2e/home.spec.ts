import { test, expect } from "@playwright/test";

test.describe("Landing smoke", () => {
  test("CTA navegar a /register", async ({ page }) => {
    await page.goto("/");
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    const link = page.getByRole("link", { name: /comenzar evaluación gratuita/i }).first();
    await expect(link).toBeVisible({ timeout: 10000 });
    await expect(link).toHaveAttribute("href", "/register");
  });
});


