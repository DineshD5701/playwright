// at top‐level of playwright.config.js
export const testDir = "tests";
export const timeout = 60000;
export const retries = 0;
export const reporter = [
  ["html"],
  ["junit", { outputFile: "results.xml" }],
  ["allure-playwright"],
];

// tell Playwright to run this file once before all tests:
export const globalSetup = "./global-setup.js";

export const projects = [
  {
    name: `Chrome`,
    use: {
      browserName: `chromium`,
      channel: `chrome`,
      headless: false,
      viewport: { width: 1000, height: 600 },
      screenshot: `only-on-failure`,
      video: `retain-on-failure`,
      trace: `retain-on-failure`,
      // load the saved session so every test starts logged‑in
      storageState: "auth.json",
    },
  },
  // …other projects
];
