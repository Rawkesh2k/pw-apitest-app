import { test as setup } from "@playwright/test";
import user from "../.auth/user.json";
import fs from "fs";

const authFile = ".auth/user.json"; //->The name 'user.json' can be different
setup("authentication", async ({ page, request }) => {
  //   await page.goto("https://conduit.bondaracademy.com/");
  //   await page.getByText("Sign in").click();
  //   await page.getByRole("textbox", { name: "Email" }).fill("pwtest@test.com");
  //   await page.getByRole("textbox", { name: "Password" }).fill("Welcome1");
  //   await page.getByRole("button").click();
  //   await page.waitForResponse("https://conduit-api.bondaracademy.com/api/tags");
  //   await page.context().storageState({ path: authFile });
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
  user.origins[0].localStorage[0].value = accessToken;
  fs.writeFileSync(authFile, JSON.stringify(user));
  process.env['ACCESS_TOKEN'] = accessToken
});
