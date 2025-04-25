// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180000, // Increase global test timeout to 60 seconds
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    timeout: 90000, // Ensure 60s timeout applies globally
    actionTimeout: 90000, // 20s timeout for individual actions
    navigationTimeout: 90000, // 30s timeout for page navigation
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        screenshot: "on",
        timeout: 90000, // Ensure timeout applies here too
        // launchOptions: {
        //   args: ['--start-maximized'], // Maximizes the window on launch
        // },
      },
    },
  ],
});
