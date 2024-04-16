import { test, expect } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route(
    // '*/**' : Match any pattern when trying to reach the the URL request
    "*/**/api/tags", // - > This is an API endpoint we are tring to reach
    async (route) => {
      await route.fulfill({ body: JSON.stringify(tags) });
    }
  );
  await page.goto("https://conduit.bondaracademy.com/");
});

test("has text", async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
});
