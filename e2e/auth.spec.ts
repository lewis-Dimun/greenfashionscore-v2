import { test, expect } from "@playwright/test";

test.describe("Auth smoke", () => {
  test("register page is reachable from home CTA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState('networkidle');
    // Find the link by href instead of text content
    const link = page.locator('a[href="/register"]').first();
    await expect(link).toBeVisible({ timeout: 10000 });
    await link.click();
    await expect(page).toHaveURL(/.*register/);
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole("form", { name: /login/i })).toBeVisible({ timeout: 10000 });
  });
});


