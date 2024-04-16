import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route(
    // '*/**' : Match any pattern when trying to reach the the URL request
    "*/**/api/tags", // - > This is an API endpoint we are trying to reach
    async (route) => {
      await route.fulfill({ body: JSON.stringify(tags) });
    }
  );
  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText("Sign in").click();
  await page.getByRole("textbox", { name: "Email" }).fill("pwtest@test.com");
  await page.getByRole("textbox", { name: "Password" }).fill("Welcome1");
  await page.getByRole("button").click();
});

test("has text", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a Mock test title";
    responseBody.articles[0].description = "This is a Mock description";

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText("Global Feed").click();
  // Expect a title "to contain" a substring.
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "This is a Mock test title"
  );
  await expect(page.locator("app-article-list p").first()).toContainText(
    "This is a Mock description"
  );
});

test("Delete article", async ({ page, request }) => {
  //import the below request from playwright library
  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: { email: "pwtest@test.com", password: "Welcome1" },
      },
    }
  );

  const responseBody = await response.json();
  console.log(responseBody.user.token);
  const accessToken = responseBody.user.token;
  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Test article created through API",
          description: "Test description created through API",
          body: "Test bodycreated through API",
          tagList: [],
        },
      },
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    }
  );
  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("Test article created through API").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await expect(page.locator("app-article-list p").first()).not.toContainText(
    "Test article created through API"
  );
});
