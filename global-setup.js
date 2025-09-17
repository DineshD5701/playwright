// global-setup.js
const { chromium, expect } = require("@playwright/test");
const testdata = require("./Generic/TestData.json");
const LoginPage = require("./Pages/LoginPage").default;
const MeeshoCXLoginPage = require("./Pages/MeeshoCXLoginPage").default;

module.exports = async () => {
  console.log("🌐 Starting Global Login Setup...");

  const browser = await chromium.launch();

  // -------------------------
  // Bigbasket login
  // -------------------------
  console.log("Bigbasket Login Started");
  const bbContext = await browser.newContext();
  const bbPage = await bbContext.newPage();

  await bbPage.goto(testdata["BigbasketoldUI URL"], { waitUntil: "domcontentloaded" });

  const loginPage = new LoginPage(bbPage);
  await loginPage.login(testdata.Bigbasketusername, testdata.Bigbasketpassword);

  // ✅ Explicit wait for search field to be visible (more reliable than 5s default)
  const searchField = bbPage.locator("//input[@placeholder='Search tickets...']");
  await searchField.waitFor({ state: "visible", timeout: 20000 });

  await bbContext.storageState({ path: "auth.json" });
  console.log("✅ Bigbasket Login Complete");
  console.log("=====================================================");

  // -------------------------
  // Meesho CX login (if needed)
  // -------------------------
  console.log("MeeshoCX Login Started");
  const cxContext = await browser.newContext();
  const cxPage = await cxContext.newPage();

  await cxPage.goto(testdata["MeeshoCX URL"], { waitUntil: "domcontentloaded" });

  const cxLoginPage = new MeeshoCXLoginPage(cxPage);
  await cxLoginPage.login(testdata.MeeshoCXusername, testdata.MeeshoCXpassword);

  await cxContext.storageState({ path: "meesho-auth.json" });
  console.log("✅ MeeshoCX Login Complete");
  console.log("=====================================================");

  await browser.close();
};
