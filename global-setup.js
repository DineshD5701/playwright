// global-setup.js
const { chromium } = require("@playwright/test");
const testdata = require("./Generic/TestData.json");
const LoginPage = require("./Pages/loginPage").default;
const MeeshoCXLoginPage = require("./Pages/MeeshoCXLoginPage").default;

module.exports = async () => {
  console.log("🌐 Starting Global Login Setup...");
  console.log("Bigbasket Login Started");
  const browser = await chromium.launch();

  // Bigbasket login
  const bbContext = await browser.newContext();
  const bbPage = await bbContext.newPage();
  await bbPage.goto(testdata["BigbasketoldUI URL"], {
    waitUntil: "networkidle",
  });
  const loginPage = new LoginPage(bbPage);
  await loginPage.login(testdata.Bigbasketusername, testdata.Bigbasketpassword);
  await bbContext.storageState({ path: "auth.json" });
  console.log("✅ Bigbasket Login Complete");
  console.log("=====================================================");

  // MeeshoCX login
  const meeshoContext = await browser.newContext();
  const meeshoPage = await meeshoContext.newPage();
  await meeshoPage.goto(testdata["MeeshoCXoldUI URL"], {
    waitUntil: "networkidle",
  });
  console.log("MeeshoCX Login Started");
  const meeshoLoginPage = new MeeshoCXLoginPage(meeshoPage);
  await meeshoLoginPage.meeshoCXlogin(
    testdata.MeeshoCXusername,
    testdata.MeeshoCXpassword
  );
  await meeshoContext.storageState({ path: "meesho-auth.json" });
  console.log("✅ MeeshoCX Login Complete");

  await browser.close();
  console.log("🚀 Global Setup Finished");
};
