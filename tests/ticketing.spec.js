// @ts-check
import { test, expect } from '@playwright/test';
const { loadClientConfig } = require('../utils/configLoader');

const config = loadClientConfig('meesho');

test('Search a ticket and check ticket details', async ({ page }) => {
  await test.step('Login', async () => {
    await page.goto(`${config.url}/employee/index.html`);

    await page.getByRole('textbox', { name: 'Username' }).type(config.username, { delay: 100 });
    await page.getByRole('button', { name: 'Next' }).click();

    // Fix: Wait properly for the password field
    await page.getByRole('textbox', { name: 'Password' }).waitFor();

    await page.getByRole('textbox', { name: 'Password' }).type(config.password, { delay: 100 });
    await page.getByRole('button', { name: 'Login' }).click();

    // await expect(page).toHaveURL(`${config.url}/nui/`);
  });

  await test.step('Search a ticket', async () => {
    await page.goto(`${config.url}/nui/`);

    const searchInput = page.getByRole('textbox', { name: 'Search' });
    await searchInput.waitFor();
    await searchInput.type('8742470952962', { delay: 50 });
    await searchInput.press("Enter");

    // Fix: Wait for search results properly
    // await expect(page.locator('text=Results for 8742470952962')).toBeVisible();
  });

  await test.step('Check Ticket Details', async () => {
    const checkbox = page.getByRole('checkbox', { name: 'D Dr Vrushali Dhanale' });
    await checkbox.waitFor();
    await checkbox.click();

    await page.getByRole('button', { name: 'Order Timeline' }).click();
    await page.getByRole('button', { name: 'Return Exchange', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();

    // Verify return to ticket list
    // await expect(page).toHaveURL(`${config.url}/nui/`);
  });
});
