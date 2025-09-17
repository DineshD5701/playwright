// playwright.config.js
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 90_000,         // 90s per test
  retries: 1,              // retry flaky tests once
  workers: 1,              // run tests sequentially inside each pod
  reporter: [
    ["html"],
    ["junit", { outputFile: "results.xml" }],
    ["allure-playwright"],
  ],

  globalSetup: "./global-setup.js",

  expect: {
    timeout: 10_000,       // 10s for expect() assertions
  },

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
