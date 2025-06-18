// global-setup.js
const { chromium } = require("@playwright/test");
const testdata = require("./Generic/TestData.json");
// Grab the default export off the namespace object:
const LoginPage = require("./Pages/LoginPage").default;
const MeeshoCXLoginPage = require("./pages/MeeshoCXloginPage").default;


module.exports = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(testdata["BigbasketoldUI URL"], { waitUntil: "networkidle" });
  const loginPage = new LoginPage(page);
  await loginPage.login(testdata.Bigbasketusername, testdata.Bigbasketpassword);

  await context.storageState({ path: "auth.json" });

  await page.goto(testdata["MeeshoCXoldUI URL"], { waitUntil: "networkidle" });
  const MeeshoCXloginPage = new MeeshoCXLoginPage(page);
  await MeeshoCXloginPage.meeshoCXlogin(testdata.MeeshoCXusername, testdata.MeeshoCXpassword);

  await context.storageState({ path: "meesho-auth.json" });

  await browser.close();
};
