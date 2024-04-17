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
});

//Test to mock the article

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

//Test to delete the article

test("Delete article", async ({ page, request }) => {
  //import the below request from playwright library

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

//Test to create the article

test("create article", async ({ page, request }) => {
  await page.getByText("New Article").click();
  await page
    .getByPlaceholder("Article Title")
    .fill("Test: Title API Article creation Brother");
  await page
    .getByPlaceholder("What's this article about?")
    .fill("Test: Description Content");
  await page
    .getByPlaceholder("Write your article (in markdown)")
    .fill("Test: Body Content");
  await page.getByRole("button", { name: "Publish Article" }).click();

  const articleResponse = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/Test:-Title-API-Article-creation-Brother-2"
  );
  const articleResponseBody = await articleResponse.json();
  const slugID = articleResponseBody.article.slug;
  //A slug ID refers to the part of a URL that uniquely identifies a resource,
  //often derived from the resource's title or name. For example,
  //in the URL "https://example.com/blog/post-title",
  //the "post-title" portion is the slug ID for the specific blog post.
  console.log("The slug ID is: " + slugID);
  await expect(page.locator(".article-page h1")).toContainText(
    "Test: Title API Article creation Brother"
  );
  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "Test: Title API Article creation Brother"
  );

  const deleteResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugID}`
  );
  expect(deleteResponse.status()).toEqual(204);
});
