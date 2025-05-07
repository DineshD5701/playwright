// global-setup.js
const { chromium } = require("@playwright/test");
const testdata = require("./Generic/TestData.json");
// Grab the default export off the namespace object:
const LoginPage = require("./Pages/LoginPage").default;

module.exports = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(testdata["BigbasketoldUI URL"], { waitUntil: "networkidle" });
  const loginPage = new LoginPage(page);
  await loginPage.login(testdata.Bigbasketusername, testdata.Bigbasketpassword);

  await context.storageState({ path: "auth.json" });
  await browser.close();
};
