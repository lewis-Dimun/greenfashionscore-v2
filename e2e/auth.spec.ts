import { test, expect } from "@playwright/test";

test.describe("Auth smoke", () => {
  test("register page is reachable from home CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /comenzar la evaluación/i }).click();
    await expect(page.getByRole("form", { name: /registro/i })).toBeVisible();
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("form", { name: /login/i })).toBeVisible();
  });
});


