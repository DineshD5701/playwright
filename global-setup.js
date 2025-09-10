// global-setup.js
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();

  // ---- Bigbasket Login ----
  const bigbasket = await browser.newPage();
  await bigbasket.goto('https://bigbasket.com/login'); // adjust
  await bigbasket.fill('[placeholder="Username"]', process.env.BB_USER || 'your_user');
  await bigbasket.fill('[placeholder="Password"]', process.env.BB_PASS || 'your_pass');
  await Promise.all([
    bigbasket.waitForNavigation({ waitUntil: 'networkidle' }),
    bigbasket.click('button:has-text("Login")')
  ]);
  await bigbasket.context().storageState({ path: 'auth.json' });

  // ---- MeeshoCX Login ----
  const meesho = await browser.newPage();
  await meesho.goto('https://meesho.kapturecrm.com/login'); // adjust
  await meesho.fill('[placeholder="Username"]', process.env.MEESHO_USER || 'your_user');
  await meesho.fill('[placeholder="Password"]', process.env.MEESHO_PASS || 'your_pass');
  await Promise.all([
    meesho.waitForNavigation({ waitUntil: 'networkidle' }),
    meesho.click('button:has-text("Login")')
  ]);
  await meesho.context().storageState({ path: 'meesho-auth.json' });

  await browser.close();
}

export default globalSetup;


// const { chromium } = require("@playwright/test");
// const testdata = require("./Generic/TestData.json");
// const LoginPage = require("./Pages/LoginPage").default;
// const MeeshoCXLoginPage = require("./Pages/MeeshoCXLoginPage").default;

// module.exports = async () => {
//   console.log("🌐 Starting Global Login Setup...");
//   console.log("Bigbasket Login Started");
//   const browser = await chromium.launch();

//   // Bigbasket login
//   const bbContext = await browser.newContext();
//   const bbPage = await bbContext.newPage();
//   await bbPage.goto(testdata["BigbasketoldUI URL"], {
//     waitUntil: "networkidle",
//   });
//   const loginPage = new LoginPage(bbPage);
//   await loginPage.login(testdata.Bigbasketusername, testdata.Bigbasketpassword);
//   await bbContext.storageState({ path: "auth.json" });
//   console.log("✅ Bigbasket Login Complete");
//   console.log("=====================================================");

  // MeeshoCX login
  // const meeshoContext = await browser.newContext();
  // const meeshoPage = await meeshoContext.newPage();
  // await meeshoPage.goto(testdata["MeeshoCXoldUI URL"], {
  //   waitUntil: "networkidle",
  // });
  // console.log("MeeshoCX Login Started");
  // const meeshoLoginPage = new MeeshoCXLoginPage(meeshoPage);
  // await meeshoLoginPage.meeshoCXlogin(
  //   testdata.MeeshoCXusername,
  //   testdata.MeeshoCXpassword
  // );
  // await meeshoContext.storageState({ path: "meesho-auth.json" });
  // console.log("✅ MeeshoCX Login Complete");

  // await browser.close();
  // console.log("🚀 Global Setup Finished");
};
