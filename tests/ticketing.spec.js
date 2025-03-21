// @ts-check
import { test, expect } from '@playwright/test';
const { loadClientConfig } = require('../utils/configLoader');

const config = loadClientConfig('meesho');

test.describe('Ticketing Tests - Meesho', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test using config URL
    await page.goto(`${config.url}/employee/index.html`);
    await page.getByRole('textbox', { name: 'Username' }).type(config.username, { delay: 100 });
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Password' }).type(config.password, { delay: 100 });
    await page.getByRole('button', { name: 'Login' }).click();
    // await expect(page).toHaveURL(`${config.url}/nui/`);
  });

  test('Search a ticket', async ({ page }) => {
    await page.goto(`${config.url}/nui/`);

    // Assuming a search input exists (adjust selector as needed)
    await page.getByRole('textbox', { name: 'Search' }).type('8742470952962', { delay: 50 });
    await page.getByRole('textbox', { name: 'Search' }).press("Enter")

  });

});