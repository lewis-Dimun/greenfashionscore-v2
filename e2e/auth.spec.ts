import { test, expect } from "@playwright/test";

test.describe("Auth smoke", () => {
  test("register page is reachable from home CTA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState('networkidle');
    const link = page.getByRole("link", { name: /comenzar la evaluación/i });
    await expect(link).toBeVisible({ timeout: 10000 });
    await link.click();
    await expect(page.getByRole("form", { name: /registro/i })).toBeVisible({ timeout: 10000 });
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole("form", { name: /login/i })).toBeVisible({ timeout: 10000 });
  });
});


