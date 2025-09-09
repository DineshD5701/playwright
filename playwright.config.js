// playwright.config.js
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 60000,
  retries: 0,
  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: '/app/allure-results' }]
  ],


  globalSetup: "./global-setup.js",

  projects: [
    {
      name: "Bigbasket",
      testMatch: ["tests/bigbasket-tests/*.spec.js"],
      use: {
        browserName: "chromium",
        channel: "chrome",
        headless: true,
        viewport: { width: 1000, height: 600 },
        storageState: "auth.json",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "retain-on-failure",
      },
    },
    {
      name: "MeeshoCX",
      testMatch: ["tests/meeshocx-tests/*.spec.js"],
      use: {
        browserName: "chromium",
        channel: "chrome",
        headless: true,
        viewport: { width: 1000, height: 600 },
        storageState: "meesho-auth.json",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "retain-on-failure",
      },
    },
  ],
});
