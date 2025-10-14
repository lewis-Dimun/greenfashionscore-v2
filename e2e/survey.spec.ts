import { test, expect } from "@playwright/test";

test.describe("Survey wizard flow (smoke)", () => {
  test("can submit after filling draft and gets redirected to dashboard", async ({ page }) => {
    await page.route(/\/functions\/v1\/scoring$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ submission_id: "subm_1", scores: { total: 70, perDimension: {}, grade: "B" }, grade: "B" })
      });
    });

    await page.goto("/survey");
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "gfs_survey_draft",
        JSON.stringify({ stepIndex: 3, answers: { PEO_Q1: "A1", PLA_Q1: "A1" } })
      );
    });
    await page.reload();

    const submit = page.getByRole("button", { name: /enviar/i });
    await expect(submit).toBeEnabled();
    await submit.click();
    await page.waitForURL(/dashboard/);
  });
});


